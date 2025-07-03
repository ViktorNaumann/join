import { Injectable, inject } from '@angular/core';
import {Firestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contact } from './contact.service';
import { Timestamp } from '@angular/fire/firestore';

export interface Task {
  id?: string;
  title: string;
  description?: string;
  date: Date | Timestamp; //Firebase verarbeitet es als Timestamp, d.h. beim Auslesen muss man es wieder umwandeln
  priority: 'low' | 'medium' | 'urgent';
  status: 'to-do' | 'in-progress' | 'await-feedback' |'done';
  assignedTo?: string[];
  category: 'technical' | 'user story';
  subtask?: Subtask[];
}
//Subtasks Interface als Subcollection für jede Task, dann vergibt Firebase autom. eine Id
export interface Subtask {
  id?: string;
  title: string;
  isCompleted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Neue Variable für die zu bearbeitende Task
  private editingTask: Task | null = null;
  
  constructor(private firestore: Firestore) { }
  
  getTasksRef() {
    return collection(this.firestore, 'tasks');
  }

  getSubtasksRef(subColId: string){
    return collection(this.getTasksRef(), subColId, 'subtasks')
  }

  getSingleTaskRef(docId: string) {
    return doc(collection(this.firestore, 'tasks'), docId);
  }

  getTasks(): Observable<Task[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getTasksRef(), snapshot => {
        const tasks: Task[] = [];
        snapshot.forEach( doc => {
          tasks.push({ id: doc.id, ...doc.data() } as Task);
        });
        observer.next(tasks);
      }, error => {
        observer.error(error);
      });

      return() => unsubscribe();
    });
  }

  getSubtasks(taskId: string): Observable<Subtask[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.getSubtasksRef(taskId), snapshot => {
        const subtasks: Subtask[] = [];
        snapshot.forEach(doc => {
          subtasks.push({ id: doc.id, ...doc.data() } as Subtask);
        });
        observer.next(subtasks);
      }, error => observer.error(error));

      return () => unsubscribe();
    });
  }

  
  async addTask(newTask: Task): Promise<Task | null> {
    try {
      const tasksRef = this.getTasksRef();
      const docRef = await addDoc(tasksRef, newTask);
      const fullTask: Task = { id: docRef.id, ...newTask };
      console.log('New task added with id:', docRef.id);
      return fullTask;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  async addSubtask(subColId: string, subtask: Subtask): Promise<Subtask | null> {
    try {
      const subtasksRef = this.getSubtasksRef(subColId);
      const docRef = await addDoc(subtasksRef, subtask);
      return { id: docRef.id, ...subtask };
    } catch (error) {
      console.error('Error adding subtask:', error);
      return null;
    }
  }

  async updateTask(docId: string, updatedTask: Task) {
    let docRef = this.getSingleTaskRef(docId);
    await updateDoc(docRef, this.getCleanJson(updatedTask)).catch((err) => {
      console.error(err);
    });
  }

  async updateSubtask(taskId: string, subtaskId: string, updatedSubtask: Subtask) {
    const docRef = doc(this.firestore, `tasks/${taskId}/subtasks/${subtaskId}`);
    await updateDoc(docRef, this.getCleanJson(updatedSubtask)).catch((err) => {
      console.error(err);
    });
  }

  async deleteTask(docId: string) {
    await deleteDoc(this.getSingleTaskRef(docId)).catch((err) => {
      console.log(err);
    });
  }

  getCleanJson(updated: Task | Subtask) {
    if ('category' in updated) {
      return {
        title: updated.title,
        description: updated.description,
        date: updated.date,
        priority: updated.priority,
        status: updated.status,
        assignedTo: updated.assignedTo,
        category: updated.category,
      };
    } else if ('isCompleted' in updated) {
      return {
        title: updated.title,
        isCompleted: updated.isCompleted
      };
    }
    return {};
  }

  convertDate(date: Timestamp | Date): string {
    if(date instanceof Timestamp) {
      return this.formatDate(date.toDate());
    } else if (date instanceof Date) {
      return this.formatDate(date);
    }
    return '';
 }

 formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Neue Methoden für das Bearbeiten von Tasks
  setEditingTask(task: Task) {
    this.editingTask = task;
  }

  getEditingTask(): Task | null {
    return this.editingTask;
  }

  clearEditingTask() {
    this.editingTask = null;
  }
}


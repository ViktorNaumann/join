import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  User,
  onAuthStateChanged,
  updateProfile
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  DocumentData 
} from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    // Überwache den Authentifizierungsstatus
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  // Registrierung
  async signUp(email: string, password: string, displayName: string): Promise<{ success: boolean; message?: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = userCredential.user;

      // Aktualisiere das Profil mit dem Anzeigenamen
      await updateProfile(user, { displayName });

      // Speichere zusätzliche Benutzerdaten in Firestore
      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: displayName,
        createdAt: new Date()
      };

      await setDoc(doc(this.firestore, 'users', user.uid), userData);

      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }

  // Anmeldung
  async signIn(email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        message: this.getErrorMessage(error.code) 
      };
    }
  }

  // Gast-Anmeldung
  async signInAsGuest(): Promise<{ success: boolean; message?: string }> {
    try {
      // Verwende einen vorgefertigten Gast-Account
      const guestEmail = 'guest@join.com';
      const guestPassword = 'Guest123!';
      
      await signInWithEmailAndPassword(this.auth, guestEmail, guestPassword);
      return { success: true };
    } catch (error: any) {
      // Falls der Gast-Account nicht existiert, erstelle ihn
      try {
        const userCredential = await createUserWithEmailAndPassword(this.auth, 'guest@join.com', 'Guest123!');
        const user = userCredential.user;

        await updateProfile(user, { displayName: 'Guest User' });

        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: 'Guest User',
          createdAt: new Date()
        };

        await setDoc(doc(this.firestore, 'users', user.uid), userData);
        return { success: true };
      } catch (createError: any) {
        return { 
          success: false, 
          message: this.getErrorMessage(createError.code) 
        };
      }
    }
  }

  // Abmeldung
  async signOutUser(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }

  // Aktuelle Benutzerdaten aus Firestore abrufen
  async getCurrentUserData(): Promise<UserData | null> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(this.firestore, 'users', currentUser.uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  }

  // Prüfe ob Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    return this.auth.currentUser !== null;
  }

  // Aktueller Benutzer
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  // Fehler-Nachrichten übersetzen
  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'User not found.';
      case 'auth/wrong-password':
        return 'Wrong password.';
      case 'auth/email-already-in-use':
        return 'Email address is already in use.';
      case 'auth/weak-password':
        return 'Password is too weak.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'User account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
}

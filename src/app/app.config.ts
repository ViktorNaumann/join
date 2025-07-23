import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAnimations } from '@angular/platform-browser/animations';
import { CDK_DRAG_CONFIG } from '@angular/cdk/drag-drop';
import { provideAuth, getAuth } from '@angular/fire/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: "AIzaSyAoaymfzBLQblTmskSpevYAasFojt8FONM",
        authDomain: "join-6e188.firebaseapp.com",
        projectId: "join-6e188",
        storageBucket: "join-6e188.firebasestorage.app",
        messagingSenderId: "955101950070",
        appId: "1:955101950070:web:f8ffcc6289ad4545fe6f57"
      })
    ),
    provideFirestore(() => getFirestore()),
    provideAnimations(),
    provideAuth(() => getAuth()),
    {
      provide: CDK_DRAG_CONFIG,
      useValue: {
        dragStartThreshold: 5,
        pointerDirectionChangeThreshold: 5,
        zIndex: 1000,
        scrollSpeed: 30,          
        scrollProximity: 100,
      },
    },
  ],
};

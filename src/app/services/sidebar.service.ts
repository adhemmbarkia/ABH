import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  // private isOpenSubject = new BehaviorSubject<boolean>(window.innerWidth >= 1024); 
  private isOpenSubject = new BehaviorSubject<boolean>(true);
  isOpen$ = this.isOpenSubject.asObservable();

  // constructor() {
  //   // Handle window resize
  //   window.addEventListener('resize', () => {
  //     if (window.innerWidth >= 1024) {
  //       this.isOpenSubject.next(true);
  //     } else {
  //       this.isOpenSubject.next(false);
  //     }
  //   });
  // }

    constructor(@Inject(PLATFORM_ID) private platformId: object) {
      // Only execute in the browser
      if (isPlatformBrowser(this.platformId)) {
        this.isOpenSubject.next(window.innerWidth >= 1024);
  
        window.addEventListener('resize', () => {
          this.isOpenSubject.next(window.innerWidth >= 1024);
        });
      }
    }
  

  toggle() {
    this.isOpenSubject.next(!this.isOpenSubject.value);
  }

  close() {
    this.isOpenSubject.next(false);
  }

  open() {
    this.isOpenSubject.next(true);
  }
}
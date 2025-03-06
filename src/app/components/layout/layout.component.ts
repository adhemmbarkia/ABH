import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { RouterModule } from '@angular/router';
import { SidebarService } from '../../services/sidebar.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SideBarComponent, RouterModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent implements OnInit {
//   isMobile = window.innerWidth < 1024;
// sidebarOpen: any;

// isMobile = false;
// // sidebarOpen: boolean = false;
// sidebarOpen$!: Observable<boolean>;
//   constructor(private sidebarService: SidebarService,
//     @Inject(PLATFORM_ID) private platformId: object
//   ) {
//     // window.addEventListener('resize', () => {
//     //   this.isMobile = window.innerWidth < 1024;
//     // });
//   }
 
  
//   ngOnInit(): void {
//   //this.sidebarOpen = this.sidebarService.isOpen$;
//   if (isPlatformBrowser(this.platformId)) {
//     this.isMobile = window.innerWidth < 1024;
//     window.addEventListener('resize', () => {
//       this.isMobile = window.innerWidth < 1024;
//     });
//   }

//   // this.sidebarService.isOpen$.subscribe((isOpen) => {
//   //   this.sidebarOpen = isOpen;
//   // });


//   this.sidebarOpen$ = this.sidebarService.isOpen$;

//   }

  isMobile = window.innerWidth < 1024;
sidebarOpen: any;
  constructor(private sidebarService: SidebarService) {
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 1024;
    });
  }
  ngOnInit(): void {
  this.sidebarOpen = this.sidebarService.isOpen$;

  }
}



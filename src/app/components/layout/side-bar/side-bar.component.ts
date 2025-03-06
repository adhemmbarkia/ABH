import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { SidebarService } from '../../../services/sidebar.service';
import { ButtonModule } from 'primeng/button';
import { filter } from 'rxjs/operators';
import { Toast } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../../services/auth.service';
import { SelectModule } from 'primeng/select';
import { DropdownModule } from 'primeng/dropdown';
import { EditProfileComponent } from '../../edit-profile/edit-profile.component';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user.model';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { PanelMenu } from 'primeng/panelmenu';

import { Popover } from 'primeng/popover';
import { PopoverModule } from 'primeng/popover';
import { AppPipesModule } from '../../../utils/app-pipes.module';
import { TieredMenuModule } from 'primeng/tieredmenu';


interface Member {
  name: string;
  image: string;
  email: string;
  role: string;
}




@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ButtonModule, 
    EditProfileComponent, 
    Toast, 
    MenuModule, 
    SelectModule, 
    DropdownModule,
    FormsModule, 
    TranslateModule,
    PopoverModule,
    AppPipesModule,
    TieredMenuModule
  ],
  templateUrl: './side-bar.component.html',
  styleUrl: './side-bar.component.css',
  providers: [MessageService],
  
})
export class SideBarComponent implements OnInit {
  isOpen = false;
  analyticsExpanded = false;
  employeeExpanded = false;
  profileDialog = false;
  
  profileMenu: MenuItem[] = [];
  user: User | null = null;
  selectedValue: any | undefined;
  selectedLanguage!: string;
  
  langs = [
    { name: 'DE', lang: 'de', code: 'de' },
    { name: 'IT', lang: 'it', code: 'it' },
    { name: 'EN', lang: 'en', code: 'GB' },
    { name: 'FR', lang: 'fr', code: 'FR' }
  ];

  @ViewChild('menu') menu: any;

  items!: MenuItem[];

  constructor(
    private sidebarService: SidebarService,
    private messageService: MessageService,
    private authService: AuthService,
    private router: Router,
    private languageService: LanguageService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.selectedValue = this.langs.find(lang => lang.lang === this.selectedLanguage);
    
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.closeOnMobile();
      
      // Check if current route should expand dropdowns
      if (event.url.includes('/analytics')) {
        this.analyticsExpanded = true;
      }
      
      if (event.url.includes('/employee')) {
        this.employeeExpanded = true;
      }
    });
  }

  @ViewChild('op') op!: Popover;

  selectedMember: Member | null = null;

  members = [
      { name: 'Amy Elsner', image: 'amyelsner.png', email: 'amy@email.com', role: 'Owner' },
      { name: 'Bernardo Dominic', image: 'bernardodominic.png', email: 'bernardo@email.com', role: 'Editor' },
      { name: 'Ioni Bowcher', image: 'ionibowcher.png', email: 'ioni@email.com', role: 'Viewer' },
  ];

  toggle(event:any) {
      this.op.toggle(event);
  }


  
  selectLanguage(lang: any) {
    this.selectedValue = lang;
    this.onChangeLang(this.selectedValue);
    this.op.hide();
  }

  selectMember(member:any) {
      this.selectedMember = member;
      this.op.hide();
  }

  

  ngOnInit() {
    this.sidebarService.isOpen$.subscribe(
      state => this.isOpen = state
    );

    this.user = this.authService.getUser();

    this.profileMenu = [
      { label: 'Profile', icon: 'pi pi-user', command: () => this.showProfileDialog() },
      { separator: true },
      { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
    ];

    


    this.items = [
      {
        label: this.languageService.instant('companyEmployee'),
        icon: 'pi pi-building',
        expanded: false,
        items: [
          {
            label: this.languageService.instant('employeeList'),
            icon: 'pi pi-file',
            routerLink: '/companies/employee',
            routerLinkActiveOptions: { exact: true }
          }
          // Add more submenu items here as needed
        ]
      }
      // Other menu items
    ];

    
  }

  toggleAnalyticsDropdown() {
    this.analyticsExpanded = !this.analyticsExpanded;
    // Optionally close other dropdowns when this one opens
    if (this.analyticsExpanded) {
      this.employeeExpanded = false;
    }
  }

  toggleEmployeeDropdown() {
    this.employeeExpanded = !this.employeeExpanded;
    // Optionally close other dropdowns when this one opens
    if (this.employeeExpanded) {
      this.analyticsExpanded = false;
    }
  }

  closeSidebar() {
    this.sidebarService.close();
  }

  toggleMenu(event: Event) {
    this.menu.toggle(event);
  }

  closeOnMobile() {
    if (window.innerWidth < 1024) {
      this.closeSidebar();
    }
  }

  logout() {
    this.authService.logout();
  }

  showProfileDialog(): void {
    console.log('Navigating to profile...');
    this.profileDialog = true;
  }

  handleConfirm(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Profile updated successfully'
    });
    this.user = this.authService.getUser();
    this.profileDialog = false;
  }

  handleCancel(): void {
    console.log('Cancelled');
    this.profileDialog = false;
  }

  onChangeLang(event: any) {
    console.log(event.lang);
    this.languageService.switchLanguage(event.lang);
  }


}
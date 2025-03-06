import { Component, OnInit } from '@angular/core';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem, MessageService } from 'primeng/api';

import { SidebarService } from '../../../services/sidebar.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';

import { EditProfileComponent } from '../../edit-profile/edit-profile.component';
import { Toast } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenuModule, Menu, EditProfileComponent, Toast,
    SelectModule, FormsModule, TranslateModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  providers : [MessageService]
})
export class HeaderComponent implements OnInit {

  menuItems!: MenuItem[];
  profileDialog:boolean=false;
    user: User | null = null;

    selectedValue: any | undefined;
    selectedLanguage!: string;
    langs = [
      { name: 'DE', lang :'de', code: 'de' },
      { name: 'IT', lang :'it', code: 'it' },
        { name: 'EN', lang :'en', code: 'GB' },
        { name: 'FR', lang :'fr', code: 'FR' }
        
    ];
  constructor(private sidebarService: SidebarService, private authService: AuthService,
    private messageService : MessageService, 
        private languageService : LanguageService
  ) {
    this.selectedLanguage = this.languageService.getCurrentLanguage();
    this.selectedValue = this.langs.find(lang => lang.lang === this.selectedLanguage);

    this.menuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.goToProfile();
        }
      },
      {
        label: 'Logout',
        icon: 'pi pi-power-off',
        command: () => {
          this.logout();
        }
      }
    ];
  }
  toggleSidebar() {
    this.sidebarService.toggle();
  }

  ngOnInit() {
      this.user = this.authService.getUser();
     
    }

  goToProfile() {
    // Implement your profile navigation logic here
    this.profileDialog = true;

  }

  logout() {
    this.authService.logout();
  }
 
   handleConfirm(): void {
      
     this.messageService.add({
       severity:'success',
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
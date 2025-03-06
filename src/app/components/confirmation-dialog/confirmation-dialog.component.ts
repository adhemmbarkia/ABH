import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

export interface FieldConfig {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'currency' | 'time' | 'boolean'; // Add more types as needed
}

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.css'
})


export class ConfirmationDialogComponent {

  @Input() visible = false;
  @Input() object: any;
  @Input() fieldsConfig: FieldConfig[] = [];
  @Input() dialogTitle = 'Confirm Action';
  @Input() confirmButtonText = 'Confirm';
  @Input() message = 'Are you sure?';
  @Input() confirmButtonClass = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  

  onConfirm(): void {
    this.confirmed.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onCancel(): void {
    this.cancel.emit();
    this.visible = false;
    this.visibleChange.emit(false);
  }
  onHide() {
    this.visible = false;

    this.visibleChange.emit(false);
  }

}

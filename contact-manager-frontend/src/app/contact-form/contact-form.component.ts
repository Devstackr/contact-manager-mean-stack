import { Component, OnInit, ViewChild, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Contact } from '../shared/models/contact.model';

@Component({
  selector: 'app-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnInit, OnChanges {

  @Input() contact: Contact;

  @Output() formSubmit: EventEmitter<Contact> = new EventEmitter<Contact>();
  @Output() formCancel: EventEmitter<void> = new EventEmitter<void>();
  @Output() contactDelete: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('contactForm') contactForm: NgForm;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges() {
    // this code will run each time an input is changed (so the contact is changed)

    // we need this code to fix a bug where optional fields (i.e. notes) don't update when the contact changes
    if (this.contactForm && this.contact && !this.contact.notes) {
      // notes is empty/null
      // we have to reset the form
      this.contactForm.resetForm(this.contact);
    }
  }

  onSubmit() {
    console.log(this.contactForm);
    let submittedContact: Contact = this.contactForm.value;
    this.formSubmit.emit(submittedContact);
  }

  onDeleteClicked() {
    this.contactDelete.emit();
  }

  onCancelClicked() {
    this.formCancel.emit();
  }

}

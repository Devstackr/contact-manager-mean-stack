import { Component, OnInit } from '@angular/core';
import { trigger, transition, query, style, stagger, animate } from '@angular/animations';
import 'simplebar';

import { Contact } from 'src/app/shared/models/contact.model';
import { ContactsService } from 'src/app/shared/services/contacts.service';



@Component({
  selector: 'app-contacts-page',
  templateUrl: './contacts-page.component.html',
  styleUrls: ['./contacts-page.component.scss'],
  animations: [
    trigger('listAnim', [
      transition('* => *', [
        query(':enter', [
          style({
            opacity: 0,
            transform: 'scale(0.85)'
          }),
          stagger(50, [
            animate(200)
          ])
        ], { optional: true })
      ])
    ]),

    trigger('itemAnim', [
      transition('void => *', [
        // Initial state
        style({
          opacity: 0,
          height: 0,
          transform: 'scale(0.85)',
          marginBottom: 0,

          // we have to 'expand' out the padding properties - this is due to a bug in Firefox
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
        }),
        // first animate the spacing (which includes the height and margin)
        animate('50ms ease', style({
          height: '*',
          marginBottom: '*',
          paddingTop: '*',
          paddingBottom: '*',
          paddingLeft: '*',
          paddingRight: '*',
        })),
        // then animate to the final state (all the other properties will animate)
        animate(68)
      ]),

      transition('* => void', [
        // first scale up
        animate(50, style({
          transform: 'scale(1.2)'
        })),
        //then scale back down to normal size while beginning to fade out
        animate(50, style({
          transform: 'scale(1)',
          opacity: 0.5
        })),
        // scale down and fade out completely
        animate(80, style({
          opacity: 0,
          transform: 'scale(0.68)'
        })),
        // we will then animate the spacing (includes the height, margin and padding)
        animate('120ms ease', style({
          height: 0,
          // we have to 'expand' out the padding properties - this is due to a bug in Firefox
          paddingTop: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          marginBottom: 0
        }))
      ])
    ])
  ]
})
export class ContactsPageComponent implements OnInit {

  contacts: Contact[] = new Array<Contact>();
  selectedContact: Contact;
  newContact: Boolean;
  contactBeingLoaded: Contact;

  constructor(private contactsService: ContactsService) { }

  ngOnInit() {
    // this.contacts.push(new Contact('John Doe', '123', 'johndoe@test.com'));

    // Get all contacts from the API
    this.showLoadingStatus(this.selectedContact);
    this.contactsService.getAll().subscribe((contacts: Contact[]) => {
      console.log(contacts);
      this.contacts = contacts;
      this.hideLoadingStatus();
    })

  }

  addContact() {
    if (!this.newContact) { // if the user isn't already creating a new contact
      let newContact: Contact = new Contact('', '', '');
      this.contacts.push(newContact);
      this.selectedContact = newContact;
      this.newContact = true;
    }
  }

  removeContact() {
    if (this.newContact) {
      // we just have to remove the contact from the array
      this.removeSelectedContactFromArray();
    } else {
      this.showLoadingStatus(this.selectedContact);
      this.contactsService.delete(this.selectedContact).subscribe(() => {
  
        this.removeSelectedContactFromArray();
        this.hideLoadingStatus();
      });
    }
  }

  removeSelectedContactFromArray() {
    let index = this.contacts.indexOf(this.selectedContact);
    this.contacts.splice(index, 1);
    this.selectedContact = null;
    this.newContact = false;
  }

  setSelectedContact(contact: Contact) {
    if (!this.newContact || contact === this.selectedContact) {
      this.selectedContact = contact;
    } else {
      alert('Please finish creating the new contact (or delete it) before carrying on.');
    }
  }

  onFormSubmit(contact: Contact) {
    contact._id = this.selectedContact._id;

    let originalContact = this.selectedContact;

    if (contact._id) {

      this.showLoadingStatus(originalContact);
      // the contact already exists in the database
      // so we have to make an update
      this.contactsService.update(contact).subscribe(() => {
        // the update was successful

        this.hideLoadingStatus();
        this.updateContactObject(originalContact, contact);
      })
    } else { // the contact doesn't have an id
      // this means that it doesn't exist in the database
      // so we have to create it
      this.showLoadingStatus(originalContact);
      this.contactsService.create(contact).subscribe((newContact: Contact) => {
        // the contact object that is returned contains the database id (_id)
        this.updateContactObject(originalContact, newContact);
        this.hideLoadingStatus();
      })
    }



  }

  showLoadingStatus(contactBeingLoaded: Contact) {
    this.contactBeingLoaded = contactBeingLoaded;
  }

  hideLoadingStatus() {
    this.contactBeingLoaded = null;
  }

  onFormCancel() {
    if (this.newContact) {
      this.removeContact();
    } else {
      this.selectedContact = null; // we are doing this to unselect the contact in the UI
    }
  }

  updateContactObject(original: Contact, updated: Contact) {
    // loop over each property in the contact obj and assign its value to the selectedContact
    for (let property in updated) {
      original[property] = updated[property];
    }

    // set newContact = false, since the form has been submitted
    this.newContact = false;
  }

}

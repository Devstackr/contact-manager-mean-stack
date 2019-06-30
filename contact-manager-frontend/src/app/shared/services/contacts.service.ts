import { Injectable } from '@angular/core';
import { WebReqService } from './web-req.service';
import { Contact } from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactsService {

  constructor(private webService: WebReqService) { }

  getAll() {
    return this.webService.get('/contacts');
  }

  create(contact: Contact) {
    return this.webService.post('/contacts', contact);
  }

  update(contact: Contact) {
    return this.webService.patch(`/contacts/${contact._id}`, contact);
  }

  delete(contact: Contact) {
    return this.webService.delete(`/contacts/${contact._id}`);
  }
}

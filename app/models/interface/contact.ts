import {db} from 'loopback';

/**
 * Contact
 *
 * @author Nika Nikabadze
 */
export interface Contact {
  email: string;
  name: string;
  message: string;
  phone: string;
}

export interface ContactDataAccessObject extends db.DataAccessObject<Contact> {

}

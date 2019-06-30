export class Contact {
    constructor(
        public name: string,
        public phoneNumber: string,
        public email: string,
        public notes?: string,
        public _id?: string
    ) {}
}
import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { UserService } from './user.service';
import { User } from './user.interface';
import { DBOperation } from './db-operation';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'registration_app';
  registrationForm: FormGroup;
  users: User[] = [];
  submitted: boolean = false;
  buttonText: string = 'Submit';
  dbops: DBOperation;

  constructor(
    private _toastr: ToastrService,
    private _fb: FormBuilder,
    private _userService: UserService
  ) {}

  getAllUser() {
    this._userService.getUsers().subscribe((res: User[]) => (this.users = res));
  }

  get f() {
    return this.registrationForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    if (this.registrationForm.invalid) {
      console.log('Form is invalid. Checking individual fields:');
      Object.keys(this.registrationForm.controls).forEach((key) => {
        const control = this.registrationForm.get(key);
        console.log(`${key} valid: ${control.valid}, errors:`, control.errors);
      });
      return;
    }
    switch (this.dbops) {
      case DBOperation.create:
        console.log('submit is clicked', this.registrationForm.value);
        const userData = this.registrationForm.value;
        this._userService.createUser(userData).subscribe({
          next: (response) => {
            console.log('User created successfully', response);
            this._toastr.success('User registered successfully!');
            this.registrationForm.reset();
            this.getAllUser();
          },
          error: (error) => {
            console.error('Error creating user', error);
            this._toastr.error('Error registering user. Please try again.');
          },
        });
        this.onCancel();
        break;
      case DBOperation.update:
        const updatedUserData = this.registrationForm.value;
        this._userService.updateUser(updatedUserData).subscribe({
          next: (response) => {
            console.log('User created successfully', response);
            this._toastr.success('Updated successfully!');
            this.registrationForm.reset();
            this.getAllUser();
          },
          error: (error) => {
            console.error('Error creating user', error);
            this._toastr.error('Error updating the user. Please try again.');
          },
        });
        this.onCancel();
        break;
    }
  }
  onCancel() {
    this.registrationForm.reset();
    this.buttonText = 'Submit';
    this.dbops = DBOperation.create;
    this.submitted = false;
  }

  ngOnInit() {
    this.setFormState();
    this.getAllUser();
  }

  getUser(id: number) {
    this._userService.getUser(id).subscribe();
  }

  Edit(userId: number) {
    this.buttonText = 'Update';
    this.dbops = DBOperation.update;

    let user = this.users.find((u: User) => u.id === userId);
    this.registrationForm.patchValue(user);
  }

  Delete(userId: number) {
    Swal.fire({
      title: 'Are you Sure?',
      text: 'You will not be able to recover this deleted record record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it!',
    }).then((result) => {
      if (result.value) {
        this._userService.deleteUser(userId).subscribe((res) => {
          this.getAllUser();
        });
        Swal.fire('Deleted!', 'You record deleted Successfully', 'success');
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'You record is safe :) ', 'error');
      }
    });
  }

  setFormState() {
    this.buttonText = 'Submit';
    this.dbops = DBOperation.create;
    this.registrationForm = this._fb.group({
      id: [0],
      title: ['', Validators.required],
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(10),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      dob: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue],
    });

    // Add this to debug individual field validations
    Object.keys(this.registrationForm.controls).forEach((key) => {
      const control = this.registrationForm.get(key);
      control.statusChanges.subscribe((status) =>
        console.log(`${key} status: ${status}`)
      );
    });
  }
}

import { Info } from './../../models/info';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

  provider: string;
  form: FormGroup;
  products: FormArray;
  value: Info;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.provider = 'ФОП Прокопюк І.В.';
    this.products = this.fb.array([this.fb.group({
        name: ['', Validators.required],
        unitsOfMeasure: ['шт', Validators.required],
        quantity: [1, [Validators.required, Validators.min(0)]],
        price: ['', [Validators.required, Validators.min(0)]]
      })
    ]);
    this.form = this.fb.group({
      client: ['', Validators.required],
      date: [new Date().toISOString().slice(0, -1), Validators.required],
      number: [''],
      products: this.products
    });
  }

  getTotalPrice(): number {
    let price = 0;
    this.value.products.forEach(p => {
      price += p.price * p.quantity;
    })
    return price;
  }

  addProduct() {
    this.products.push(this.fb.group({
      name: ['', Validators.required],
      unitsOfMeasure: ['шт', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
        price: ['', [Validators.required, Validators.min(0)]]
    }));
  }

  removeProduct(index: number) {
    if (this.products.value.length > 1) {
      this.products.removeAt(index);
    }
  }

  onSubmit() {
    this.value = this.form.value as Info;
  }

}

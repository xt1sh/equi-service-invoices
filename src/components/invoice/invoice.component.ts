import { Info } from './../../models/info';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {

  form: FormGroup;
  products: FormArray;
  returnProducts: FormArray;
  value: Info;
  hasReturn: boolean;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.hasReturn = false;
    this.products = this.fb.array([]);
    this.addProduct();
    this.returnProducts = this.fb.array([]);
    this.addReturnProduct();
    this.form = this.fb.group({
      provider: ['ФОП Прокопюк І.В.', Validators.required],
      client: ['', Validators.required],
      date: [new Date().toISOString().slice(0, -1), Validators.required],
      number: [''],
      discount: 0,
      returnDiscount: 0,
      products: this.products,
      returnProducts: this.returnProducts
    });
  }

  getTotalPrice(): number {
    let price = 0;
    this.value.products.forEach(p => {
      price += p.price * p.quantity;
    })
    return price;
  }

  getTotalPriceWithDiscount(): number {
    let price = 0;
    this.value.products.forEach(p => {
      price += p.price * p.quantity;
    })
    let discount = this.form.value.discount;
    return price * (100 - discount) / 100;
  }

  getTotalReturnPrice(): number {
    let price = 0;
    this.value.returnProducts.forEach(p => {
      price += p.price * p.quantity;
    })
    return price;
  }

  getTotalReturnPriceWithDiscount(): number {
    let price = 0;
    this.value.returnProducts.forEach(p => {
      price += p.price * p.quantity;
    })
    let discount = this.form.value.returnDiscount;
    return price * (100 - discount) / 100;
  }

  addProduct() {
    this.products.push(this.fb.group({
      name: ['', Validators.required],
      unitsOfMeasure: ['шт', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
    }));
  }

  addReturnProduct() {
    this.returnProducts.push(this.fb.group({
      name: ['', Validators.required],
      unitsOfMeasure: ['шт', Validators.required],
      quantity: [1, [Validators.required, Validators.min(0)]],
      price: ['', [Validators.required, Validators.min(0)]],
    }));
  }

  removeProduct(index: number) {
    if (this.products.value.length > 1) {
      this.products.removeAt(index);
    }
  }

  removeReturnProduct(index: number) {
    if (this.returnProducts.value.length > 1) {
      this.returnProducts.removeAt(index);
    }
  }

  onSubmit() {
    this.value = this.form.value as Info;
  }

}

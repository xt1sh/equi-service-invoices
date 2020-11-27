import { Product } from './../../../models/product';
import { ProviderInfo } from './../../../models/provider-info';
import { FirestoreService } from './../../services/firestore.service';
import { NotificationService } from './../../services/notification.service';
import { Info } from '../../../models/info';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import Fuse from 'fuse.js';
import { throwIfEmpty } from 'rxjs/operators';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit, OnDestroy {

  form: FormGroup;
  products: FormArray;
  returnProducts: FormArray;
  value: Info;
  hasReturn: boolean;
  providersInfo: ProviderInfo[];
  existingProducts: Product[];
  filteredProducts: Product[];
  fuse: Fuse<Product>;

  private subscription: Subscription;

  constructor(private fb: FormBuilder,
    private notificationService: NotificationService,
    private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.notificationService.changeLoading(true);

    this.subscription = new Subscription();
    this.providersInfo = [];
    this.existingProducts = [];
    this.filteredProducts = [];

    let productsSub = this.firestoreService.getAllProducts().subscribe(products => {
      this.existingProducts = products;
      this.initializeFuse();
    });
    this.subscription.add(productsSub);

    this.initializeForm();
    let counterCollection = this.firestoreService.getInvoiceCounterCollection();

    let fireStoreListenerSub = counterCollection.snapshotChanges().subscribe(res => {
      if (res?.length) {
        this.providersInfo = res.map(doc => doc.payload.doc.data() as ProviderInfo);
        this.notificationService.changeLoading(false);
        this.setCount();
      }
    });
    this.subscription.add(fireStoreListenerSub);

    this.hasReturn = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  initializeFuse() {
    this.fuse = new Fuse(this.existingProducts, {
      keys: ['name']
    });
  }

  initializeForm() {
    this.products = this.fb.array([]);
    this.addProduct();
    this.returnProducts = this.fb.array([]);
    this.addReturnProduct();
    this.form = this.fb.group({
      provider: ['ФОП Прокопюк І.В.', Validators.required],
      client: ['', Validators.required],
      date: [new Date().toISOString().slice(0, -1), Validators.required],
      number: 0,
      discount: 0,
      returnDiscount: 0,
      products: this.products,
      returnProducts: this.returnProducts
    });
  }

  setCount() {
    let provider = this.form.get('provider').value;
    let count = this.providersInfo.find(info => info.provider === provider)?.count;
    this.form.get('number').setValue(count);
  }

  getTotalPrice(): number {
    let price = 0;
    this.value.products.forEach(p => {
      price += p.price * p.quantity;
    });
    return price;
  }

  getTotalPriceWithDiscount(): number {
    let price = 0;
    this.value.products.forEach(p => {
      price += p.price * p.quantity;
    });
    let discount = this.form.value.discount;
    return price * (100 - discount) / 100;
  }

  getTotalReturnPrice(): number {
    let price = 0;
    this.value.returnProducts.forEach(p => {
      price += p.price * p.quantity;
    });
    return price;
  }

  getTotalReturnPriceWithDiscount(): number {
    let price = 0;
    this.value.returnProducts.forEach(p => {
      price += p.price * p.quantity;
    });
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

  saveProducts() {
    let addedProducts = this.products.value as Product[];
    let productsToChange: Product[] = [];
    let productsToAdd: Product[] = [];
    addedProducts.forEach(product => {
      let existingProduct = this.existingProducts.find(p => p.name === product.name);
      if (existingProduct) {
        if (existingProduct.price !== product.price || existingProduct.unitsOfMeasure !== product.unitsOfMeasure) {
          productsToChange.push(product);
          existingProduct = product;
          this.initializeFuse();
        }
      } else {
        productsToAdd.push(product);
        this.existingProducts.push(product);
        this.initializeFuse();
      }
    });
    if (productsToAdd.length) {
      this.firestoreService.saveNewProducts(productsToAdd);
    }
    if (productsToChange.length) {
      this.firestoreService.updateProducts(productsToChange);
    }
  }

  onNameChange(e: string, product: FormGroup) {
    if (e && product) {
      this.filteredProducts = this.fuse.search(e).map(item => item.item);
      let value = product.value as Product;
      let foundProduct = this.existingProducts.find(p => p.name.toUpperCase() === value.name.toUpperCase());
      if (foundProduct) {
        product.get('unitsOfMeasure').setValue(foundProduct.unitsOfMeasure);
        product.get('price').setValue(foundProduct.price);
      }
    } else {
      this.filteredProducts = [];
    }
  }

  onDelete(name: string) {
    let index = this.existingProducts.findIndex(p => p.name === name);
    this.existingProducts.splice(index, 1);
    index = this.filteredProducts.findIndex(p => p.name === name);
    this.filteredProducts.splice(index, 1);
    this.initializeFuse();
    this.firestoreService.deleteProduct(name);
  }

  onSubmit() {
    this.value = this.form.value as Info;
    let number = this.value.number + 1;
    this.firestoreService.getInvoiceCounterCollection(ref => ref.where('provider', '==', this.value.provider)).get()
      .subscribe(sn => {
        sn.docs[0].ref.update({
          count: number
        }).then();
      });
    this.saveProducts();
  }

  onCancel() {
    this.hasReturn = false;
    this.initializeForm();
    this.filteredProducts = [];
    this.initializeFuse();
    this.setCount();
  }

}

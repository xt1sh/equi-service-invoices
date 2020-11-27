import { ProviderInfo } from './../../../models/provider-info';
import { FirestoreService } from './../../services/firestore.service';
import { NotificationService } from './../../services/notification.service';
import { Info } from '../../../models/info';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';

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

  private subscription: Subscription;

  constructor(private fb: FormBuilder,
    private notificationService: NotificationService,
    private firestoreService: FirestoreService) { }

  ngOnInit() {
    this.subscription = new Subscription();
    this.providersInfo = [];
    this.notificationService.changeLoading(true);
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

    let productsSub = this.firestoreService.getAllProducts().subscribe(console.log)
    this.subscription.add(productsSub);
    this.hasReturn = false;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  }

  onSubmit() {
    this.value = this.form.value as Info;
    let number = this.value.number + 1;
    // this.firestoreService.getInvoiceCounterCollection(ref => ref.where('provider', '==', this.value.provider)).get()
    //   .subscribe(sn => {
    //     sn.docs[0].ref.update({
    //       count: number
    //     }).then();
    //   });
  }

  onCancel() {
    this.hasReturn = false;
    this.initializeForm();
    this.setCount();
  }

}

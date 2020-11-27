import { environment } from 'src/environments/environment';
import { Product } from './../../models/product';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentData, QueryFn } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  getInvoiceCounterCollection(query?: QueryFn<DocumentData>): AngularFirestoreCollection<unknown> {
    let collectionName = 'invoice-count';
    return query ? this.firestore.collection(collectionName, query) : this.firestore.collection(collectionName);
  }

  getAllProducts(): Observable<Product[]> {
    return this.firestore.collection('products').get().pipe(
      map(res => res.docs.map(doc => doc.data() as Product)),
      map(res => res.filter(p => p.name))
    );
  }

  saveNewProducts(products: Product[]) {
    products.filter(p => p.name).forEach(product => this.firestore.collection('products').add({ name: product.name, price: product.price, unitsOfMeasure: product.unitsOfMeasure }).then());
  }

  updateProducts(products: Product[]) {
    products.filter(p => p.name).forEach(product => {
      this.firestore.collection('products', q => q.where('name', '==', product.name)).get().subscribe(ps => {
        ps.docs.forEach(p => p.ref.update({ price: product.price, unitsOfMeasure: product.unitsOfMeasure }).then());
      });
    });
  }

  deleteProduct(name: string) {
    this.firestore.collection('products', q => q.where('name', '==', name).limit(1)).get().subscribe(ps => {
      let product = ps.docs[0];
      product.ref.delete().then();
    });
  }
}

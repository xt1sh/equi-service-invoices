import { environment } from 'src/environments/environment';
import { Product } from './../../models/product';
import { Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, DocumentData, QueryFn } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore: AngularFirestore) { }

  getInvoiceCounterCollection(query?: QueryFn<DocumentData>): AngularFirestoreCollection<unknown> {
    let  collectionName = 'invoice-count';
    return query ? this.firestore.collection(collectionName, query) : this.firestore.collection(collectionName);
  }

  getAllProducts(): Observable<Product[]> {
    return this.firestore.collection('products').get().pipe(
      map(res => res.docs.map(doc => doc.data() as Product))
    );
  }

  saveProducts() {

  }
}

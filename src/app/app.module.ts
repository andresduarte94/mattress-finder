import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { AppRoutingModule } from './app-router.module';

import { MainComponent } from './main/main.component';
import { ProductsComponent } from './products/products.component';
import { FooterComponent } from './footer/footer.component';
import { BlogComponent } from './blog/blog.component';
import { ProductListComponent } from './products/product-list/product-list.component';
import { ProductItemComponent } from './products/product-list/product-item/product-item.component';
import { SharedModule } from './shared/shared.module';

import { JwPaginationComponent } from 'jw-angular-pagination';
import { ProductDisplayComponent } from './products/product-display/product-display.component';
import { PostsListComponent } from './blog/posts-list/posts-list.component';
import { PostComponent } from './blog/posts-list/post/post.component';
import { PostItemComponent } from './blog/posts-list/post-item/post-item.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NouisliderModule } from 'ng2-nouislider';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MainComponent,
    ProductsComponent,
    FooterComponent,
    BlogComponent,
    ProductListComponent,
    ProductItemComponent,
    JwPaginationComponent,
    ProductDisplayComponent,
    PostsListComponent,
    PostComponent,
    PostItemComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    NouisliderModule,
    BrowserAnimationsModule,
    MatRadioModule,
    MatSliderModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  exports: [ProductItemComponent],
  entryComponents: [ProductItemComponent],
  bootstrap: [AppComponent],
  // providers: [LoggingService]
})
export class AppModule { }

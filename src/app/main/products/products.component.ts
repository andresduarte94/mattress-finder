import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/shared/global.service';
import { ProductsService } from './products.service';
import { Filter } from './filter.model';
import { Product } from './product.model';
import { NouisliderComponent } from 'ng2-nouislider/ng2-nouislider.component';


@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {
  //Global variables
  country: string;
  language: string;
  translationWords: any;
  componentWords: any;

  //Product variables
  productTypes: string[];
  filter: Filter;
  products: Product[] = [];

  // Filter menu variables
  sizes: string[] = [];
  filterForm: FormGroup;
  checkedRadioPayment: number = null;
  public priceSliderValue: number[] = [0, 2000];
  @ViewChild('priceSlider', { static: false }) priceSlider: NouisliderComponent;
  @ViewChild('sliderForm', { static: false }) sliderForm: NgForm;
  filterUpdateSub: Subscription;
  isUntouchedFilterForm: boolean = true;

  //Ui variables
  navbarOpen = false;
  public innerWidth: any;

  constructor(private globalService: GlobalService, private activatedRoute: ActivatedRoute, private productsService: ProductsService) { }

  ngOnInit() {
    //Global variables initialization
    this.country = this.globalService.getCountry();
    this.language = this.globalService.getLanguage();
    this.translationWords = this.globalService.getTranslationLanguage();
    this.componentWords = this.translationWords['product-display'];
    //Product variables initialization
    this.productTypes = this.productsService.productTypes;
    this.sizes = this.productsService.getSizes(1);
    //Ui variables
    this.innerWidth = window.innerWidth;
    if (this.innerWidth >= 762) {
      this.navbarOpen = true;
    }

    //Create, initialize and set subscriptions for filter form
    this.createReactiveFilterForm();

    //Params subscription for setting language and productType filter
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        // Update language and translation words
        this.language = params.language;
        this.translationWords = this.globalService.getTranslationLanguage();
        this.componentWords = this.translationWords['product-display'];
        this.globalService.updateSubComponentLanguage.next(this.translationWords);

        let currentPoductTypeId;
        this.filter = this.filter ? this.filter : {};
        this.filter.country = this.country;

        //Update products based on new productType from URL
        if (params.hasOwnProperty('productType')) {
          currentPoductTypeId = this.productsService.getProductTypeId(params.productType);
          this.filter.type = currentPoductTypeId;
          this.filterForm.controls['productType'].setValue(currentPoductTypeId);
        }

        this.updateProducts(this.filter);
      }
    );

    //Update filters from search bar and filter menu events
    this.filterUpdateSub = this.productsService.filterUpdateEvent.subscribe((filter: Filter) => {
      Object.keys(filter).forEach((key) => {
        this.filter[key] = filter[key];
      });
      this.updateProducts(this.filter);
    });

    //QueryParams subscription for search bar filter
    this.activatedRoute.queryParams.subscribe(
      (queryParams: Params) => {
        this.filter.country = this.country = queryParams.gl ? queryParams.gl : 'all';
        this.updateProducts(this.filter);
      }
    );
  }

  //Update products based on new filter
  updateProducts(filter: Filter) {
    let products = this.productsService.getProducts(filter);
    this.products = products;
  }

  // Create filters form with all inputs and value changes subscriptions
  createReactiveFilterForm() {
    //Create and initialize form
    this.filterForm = new FormGroup({
      'productType': new FormControl(0),
      'priceSlider': new FormControl(null),
      'sizes': new FormGroup(this.sizes.reduce((sizesArray, size) => {
        sizesArray[size] = new FormControl(null);
        return sizesArray;
      }, {})),
      'mindiscount': new FormControl(0),
      'payments': new FormControl(null)
    });

    //Reactive filter form changes subscriptions
    //Product type filter
    this.filterForm.controls['productType'].valueChanges.subscribe(
      (productTypeId) => {
        this.filter.type = +productTypeId;
        // Update products filter with product type change
        this.updateProducts(this.filter);
      }
    );
    //Min price and Max Price slider filter
    this.filterForm.controls['priceSlider'].valueChanges.subscribe(
      (values) => {
        this.filter.minprice = this.priceSliderValue[0];
        this.filter.maxprice = this.priceSliderValue[1];
        this.updateProducts(this.filter);
      }
    );
    //Sizes filter
    this.filterForm.controls['sizes'].valueChanges.subscribe(
      (values) => {
        let sizeArrayValues = [];
        for (var size in values) {
          if (values[size]) {
            sizeArrayValues.push(size);
          }
        }

        if (sizeArrayValues.length == 0) {
          delete this.filter.sizes;
          this.updateProducts(this.filter);
        }
        else {
          this.filter.sizes = sizeArrayValues;
          this.updateProducts(this.filter);
        }
      }
    );
    //Minimum discount filter
    this.filterForm.controls['mindiscount'].valueChanges.subscribe(
      (mindiscount) => {
        this.filter.mindiscount = mindiscount;
        this.updateProducts(this.filter);
      }
    );
    //Payments filter
    this.filterForm.controls['payments'].valueChanges.subscribe(
      (payments) => {
        this.checkedRadioPayment = payments;
        this.filter.payments = payments;
        this.updateProducts(this.filter);
      }
    );
  }

  updateScoreFilter(score: number) {
    this.filter.minscore = score;
    this.updateProducts(this.filter);
  }

  //Price slider configuration
  private priceSliderEventHandler = (e: KeyboardEvent) => {
    // determine which handle triggered the event
    let index = parseInt((<HTMLElement>e.target).getAttribute('data-handle'));
    let multiplier: number = 0;
    let stepSize = 0.1;
    switch (e.which) {
      case 40:  // ArrowDown
      case 37:  // ArrowLeft
        multiplier = -2;
        e.preventDefault();
        break;
      case 38:  // ArrowUp
      case 39:  // ArrowRight
        multiplier = 3;
        e.preventDefault();
        break;
      default:
        break;
    }
    let delta = multiplier * stepSize;
    let newValue = [].concat(this.priceSliderValue);
    newValue[index] += delta;
    this.priceSliderValue = newValue;
  }
  public i = 0;
  public priceSliderConfig: any = {
    start: this.priceSliderValue,
    keyboard: true,
    connect: [false, true, false],
    onKeydown: this.priceSliderEventHandler,
    range: {
      min: 0,
      '60%': 200,
      '80%': 300,
      '95%': 1800,
      max: 2000
    },
    step: 10,
    format: {
      from: Number,
      to: (value) => {
        let val = Math.ceil(value);
        if (this.i == 0 || this.i % 2 == 0) {
          this.priceSliderValue[0] = val;
        }
        else {
          this.priceSliderValue[1] = val;
        }
        this.i++;
        return val + " €";
      }
    }
  }
  formatLabel(value: number) {
    return value + '%';
  }

  // UI functions
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
  }

  uncheckRadio(event, radio: number) {
    if (this.checkedRadioPayment == radio) {
      event.preventDefault()
      this.checkedRadioPayment = null;
      this.filterForm.controls['payments'].reset();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (this.innerWidth == window.innerWidth) {
      return;
    }
    this.innerWidth = window.innerWidth;
    this.navbarOpen = this.innerWidth >= 762 ? true : false;
  }

  // Lifehooks functions
  ngOnDestroy() {
    if (this.filterUpdateSub) this.filterUpdateSub.unsubscribe();
  }
}


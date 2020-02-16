import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ProductsService } from '../products.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Filter } from './filter.model';
import { Product } from '../product.model';
import { FormGroup, FormControl, NgForm } from '@angular/forms';
import { NouisliderComponent } from '../../../../node_modules/ng2-nouislider/ng2-nouislider.component';
import { Subscription } from 'rxjs';

declare var componentHandler: any;

@Component({
  selector: 'app-product-display',
  templateUrl: './product-display.component.html',
  styleUrls: ['./product-display.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ProductDisplayComponent implements OnInit {
  productTypes: string[];
  filter: Filter;
  products: Product[] = [];
  sizes: string[] = [];
  defaultType: number = 0;
  filterForm: FormGroup;
  checkedRadioPayment: number = null;
  public priceSliderValue: number[] = [0, 800];
  @ViewChild('priceSlider', { static: false }) priceSlider: NouisliderComponent;
  @ViewChild('sliderForm', { static: false }) sliderForm: NgForm;
  filterUpdateSub: Subscription;

  constructor(private productsService: ProductsService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.productTypes = this.productsService.productTypes;
    this.sizes = this.productsService.getSizes(1);

    //Params subscription for manual URL and header bar links
    this.activatedRoute.params.subscribe(
      (params: Params) => {
        if (!params.hasOwnProperty('filter') || params.filter == 'all') {
          this.filter = {};
        }
        else if (params.filter == 'filter') {
          return;
        }
        else {
          this.filter = { type: this.productsService.getProductTypeId(params.filter) };
        }
        this.productsService.clearFilterEvent.next(this.filter);
        this.updateProducts(this.filter);
      }
    );

    this.filterUpdateSub = this.productsService.filterUpdateEvent.subscribe((filter: Filter) => {
      Object.keys(filter).forEach((key) => {
        this.filter[key] = filter[key];
      });
      console.log(this.filter)
      this.updateProducts(this.filter);
    });
    

    //QueryParams subscription for search bar filter
    this.activatedRoute.queryParams.subscribe(
      (queryParams: Params) => {
        if (queryParams.gl) {
          this.filter.country = queryParams.gl;
          this.updateProducts(this.filter);
        }
      }
    );

    this.createReactiveForm();
  }

  createReactiveForm() {
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

    //Reactive form changes subscriptions
    this.filterForm.controls['productType'].valueChanges.subscribe(
      (productType) => {
        this.filter.type = productType;
        this.updateProducts(this.filter);
      }
    );
    this.filterForm.controls['priceSlider'].valueChanges.subscribe(
      (values) => {
        this.filter.minprice = this.priceSliderValue[0];
        this.filter.maxprice = this.priceSliderValue[1];
        this.updateProducts(this.filter);
      }
    );

    this.filterForm.controls['sizes'].valueChanges.subscribe(
      (values) => {
        let sizesArray = [];
        for (var size in values) {
          if (values[size]) {
            sizesArray.push(size);
          }
        }

        if (sizesArray.length == 0) {
          delete this.filter.sizes;
          this.updateProducts(this.filter);
        }
        else {
          this.filter.sizes = sizesArray;
          this.updateProducts(this.filter);
        }
      }
    );
    this.filterForm.controls['mindiscount'].valueChanges.subscribe(
      (mindiscount) => {
        this.filter.mindiscount = mindiscount;
        this.updateProducts(this.filter);
      }
    );
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

  ngAfterContentChecked() {
    componentHandler.upgradeAllRegistered();
  }

  createSizesControl() {
    let sizesArray = this.sizes.reduce((sizesArray, size) => {
      sizesArray.push(new FormControl(size));
      return sizesArray;
    }, []);
    console.log(sizesArray);
    return sizesArray;
  }

  uncheckRadio(event, radio: number) {
    if (this.checkedRadioPayment == radio) {
      event.preventDefault()
      this.checkedRadioPayment = null;
      this.filterForm.controls['payments'].reset();
    }
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
      '70%': 300,
      max: 800
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

  //Update products based on new filter
  updateProducts(filter: Filter) {
    let products = this.productsService.getProducts(filter);
    this.products = products;
  }

  ngOnDestroy() {
    this.filterUpdateSub.unsubscribe();
  }
}

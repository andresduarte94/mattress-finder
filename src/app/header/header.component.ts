import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../products/products.service';
import { Filter } from '../products/product-display/filter.model';
import { FormGroup } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { GlobalService } from '../shared/global.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  countries = new FormControl();
  languages = new FormControl();
  countriesList: string[] = ['All countries', 'Amazon US', 'Amazon Spain'];
  countriesCodes: string[] = ['all', 'us', 'es'];
  languagesList: string[] = ['English', 'Español'];
  languagesCodes: string[] = ['en', 'es'];
  productTypes: string[];
  filter: Filter = {};
  searchForm: FormGroup;
  countryForm: FormGroup;
  clearFilterSub: Subscription;
  country: string;
  language: string;
  translationWords: any;
  componentWords: any;

  constructor(private productsService: ProductsService, private router: Router, private activatedRoute: ActivatedRoute,
    private globalService: GlobalService) { }

  ngOnInit() {
    //Set language from parameter and get translations words for rendering
    this.country = this.globalService.getCountry();
    this.language = this.globalService.getLanguage();
    this.translationWords = this.globalService.getTranslationLanguage(this.language);
    console.log( this.translationWords)

    this.componentWords = this.translationWords['header'];
    this.productTypes = this.productsService.productTypes.slice();
    let activatedRouteURL: string;

    //Create reactive form for country and language
    this.countryForm = new FormGroup({
      'countries': new FormControl('all'),
      'languages': new FormControl('en')
    });
    this.searchForm = new FormGroup({
      'search': new FormControl(''),
    });

    //Navigating with country query parameter change
    this.countryForm.controls['countries'].valueChanges.subscribe(
      (country) => {
        activatedRouteURL = this.activatedRoute.snapshot['_routerState'].url;
        const baseURL = activatedRouteURL.indexOf('?') > -1 ? activatedRouteURL.slice(3, activatedRouteURL.indexOf('?')) : activatedRouteURL.slice(3);
        this.country = country;
        this.router.navigateByUrl(
          this.language
          + baseURL
          + '?' + 'gl=' + this.country
        );
      });

    //Navigating with language parameter change
    this.countryForm.controls['languages'].valueChanges.subscribe(
      (language) => {
        activatedRouteURL = this.activatedRoute.snapshot['_routerState'].url;
        const baseURL = activatedRouteURL.indexOf('?') > -1 ? activatedRouteURL.slice(3, activatedRouteURL.indexOf('?')) : activatedRouteURL.slice(3);
        this.language = language;
        this.globalService.setLanguage(language);
        this.translationWords = this.globalService.getTranslationLanguage(language);
        this.componentWords = this.translationWords['header'];
        this.router.navigateByUrl(
          this.language
          + baseURL
          + '?' + 'gl=' + this.country
        );
      });

    //Updating products on search input change
    this.searchForm.controls['search'].valueChanges.subscribe(
      (search) => {
        activatedRouteURL = this.activatedRoute.snapshot['_routerState'].url;
        this.filter.description = search;
        this.filter.name = search;
        //If search is in Home route then hide banner
        if (search != '' && activatedRouteURL.indexOf('home') > -1) {
          this.productsService.hideBannerEvent.next(true);
        }
        //Update name and description wfilter 
        this.productsService.filterUpdateEvent.next(this.filter);
      });
    //Clear search bar on clearFilterEvent
    this.clearFilterSub = this.productsService.clearFilterEvent.subscribe(() => {
      this.searchForm.controls['search'].setValue('');
    });
  }

  routeHome() {
    this.productsService.hideBannerEvent.next(false);
    this.router.navigate([this.language, 'home'], {
      queryParams: {
        gl: this.country
      }
    });
  }

  ngOnViewInit() {
  }

  ngOnDestroy() {
    this.clearFilterSub.unsubscribe();
  }

}

import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import paginate from 'jw-paginate';
import { ScrollService } from '../scroll.service';
import { GlobalService } from '../global.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'jw-pagination',
  template: `<ul *ngIf="pager.pages && pager.pages.length" class="pagination">
    <li [ngClass]="{disabled:pager.currentPage === 1}" class="page-item first-item">
      <a (click)="setPage(1); scrollTop();" class="page-link">{{ componentWords.firstLabel }}</a>
    </li>
    <li [ngClass]="{disabled:pager.currentPage === 1}" class="page-item previous-item">
      <a (click)="setPage(pager.currentPage - 1); scrollTop();" class="page-link">{{ componentWords.previousLabel }}</a>
    </li>
    <li *ngFor="let page of pager.pages" [ngClass]="{active:pager.currentPage === page}" class="page-item number-item">
      <a (click)="setPage(page); scrollTop();" class="page-link">{{page}}</a>
    </li>
    <li [ngClass]="{disabled:pager.currentPage === pager.totalPages}" class="page-item next-item">
      <a (click)="setPage(pager.currentPage + 1); scrollTop();" class="page-link">{{ componentWords.nextLabel }}</a>
    </li>
    <li [ngClass]="{disabled:pager.currentPage === pager.totalPages}" class="page-item last-item">
      <a (click)="setPage(pager.totalPages); scrollTop();" class="page-link">{{ componentWords.lastLabel }}</a>
    </li>
  </ul>`,
  styleUrls: ['./jw-pagination.component.scss'],
})

export class JwPaginationComponent implements OnInit, OnChanges {
  @Input() items: Array<any>;
  @Output() changePage = new EventEmitter<any>(true);
  @Input() initialPage = 1;
  @Input() pageSize = 10;
  @Input() maxPages = 10;
  componentWords: any;
  pager: any = {};
  updateLanguageSub: Subscription;

  constructor(private scrollService: ScrollService, private globalService: GlobalService) { }

  ngOnInit() {
    this.componentWords = this.globalService.getTranslationLanguage()['blog'];
    // set page if items array isn't empty
    if (this.items && this.items.length) {
      this.setPage(this.initialPage);
    }
    this.updateLanguageSub = this.globalService.updateLanguage.subscribe((translationWords: any) => {
      this.componentWords = translationWords['blog'];
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // reset page if items array has changed
    if (changes.items && changes.items.currentValue && changes.items.previousValue) {
      if (changes.items.currentValue !== changes.items.previousValue) {
        this.setPage(this.initialPage);
      }
    }
  }

  setPage(page: number) {
    // get new pager object for specified page
    this.pager = paginate(this.items.length, page, this.pageSize, this.maxPages);
    // get new page of items from items array
    var pageOfItems = this.items.slice(this.pager.startIndex, this.pager.endIndex + 1);
    // call change page function in parent component
    this.changePage.emit(pageOfItems);
  }

  scrollTop() {
    // Scroll to the top of filtersContainer element (products display)
    this.scrollService.scrollToElementById('filters-header');
  }

  ngOnDestroy() {
    if (this.updateLanguageSub) {
      this.updateLanguageSub.unsubscribe();
    }
  }
}
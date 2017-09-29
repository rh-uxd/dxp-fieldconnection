import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'productfilter',
  pure: false
})
export class ProductPipe implements PipeTransform {
  transform(items: any[], filter: string[]): any[] {
    if (!items || !filter) {
      return items;
    }
    // filter items array, items which match and return true will be kept, false will be filtered out
    return items.filter((item: any) => {
      if (filter.length > 0 && item['productId']) {
        return filter.indexOf(item['productId']) !== -1;
      }
      // automatically show all if there is no filter
      return true;
    });
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  pure: false
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], pageIndex: number, pageSize: number = 10): any {
    if (!items || typeof pageIndex !== 'number' || pageIndex < 0) {
      return items;
    }
    return items.slice((pageIndex) * pageSize, (pageIndex + 1) * pageSize);
  }

}

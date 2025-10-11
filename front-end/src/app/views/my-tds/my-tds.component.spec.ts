import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyTdsComponent } from './my-tds.component';

describe('MyTdsComponent', () => {
  let component: MyTdsComponent;
  let fixture: ComponentFixture<MyTdsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyTdsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyTdsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

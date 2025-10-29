import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatInnerComponent } from './chat-inner.component';

describe('ChatInnerComponent', () => {
  let component: ChatInnerComponent;
  let fixture: ComponentFixture<ChatInnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatInnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChatInnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

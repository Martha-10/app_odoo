import { TestBed } from '@angular/core/testing';

import { Oportunidades } from './oportunidades';

describe('Oportunidades', () => {
  let service: Oportunidades;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Oportunidades);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

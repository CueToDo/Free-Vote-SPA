import { FVBSPage } from './app.po';

describe('fvbs App', () => {
  let page: FVBSPage;

  beforeEach(() => {
    page = new FVBSPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

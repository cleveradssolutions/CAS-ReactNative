#import "RNCASStarRatingContainer.h"

@implementation RNCASStarRatingContainer {
  CASStarRatingView *_starView;
}

- (instancetype)initWithFrame:(CGRect)frame {
  if (self = [super initWithFrame:frame]) {
    self.userInteractionEnabled = NO;

    _starView = [[CASStarRatingView alloc] initWithFrame:self.bounds];
    _starView.translatesAutoresizingMaskIntoConstraints = YES;
    _starView.autoresizingMask =
      UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;

    [self addSubview:_starView];
  }
  return self;
}

- (void)setRating:(NSNumber *)rating {
  _rating = rating;
  _starView.rating = rating;
}

@end

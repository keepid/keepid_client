import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Slider from 'react-slick';

const TestimonialMessages = defineMessages({
  header: {
    id: 'home.testimonials.header',
    defaultMessage: 'Testimonials',
  },
});

const testimonialsData = [
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labor',
    author: 'Daniel Joo, CEO of Apple',
  },
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco labor',
    author: 'Daniel Joo, Astronaut',
  },
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim',
    author: 'Daniel Joo, USA Olympian',
  },
  {
    quote:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. ',
    author: 'Daniel Joo, Nobel laureate',
  },
];

function Testimonials() {
  const intl = useIntl();
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    adaptiveHeight: true,
  };

  return (
    <>
      <style>{`
        /* Styles for the navigation dots */
        .slick-dots li button:before {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.5);
        }

        /* FIX: This makes the arrows visible against a light background */
        // .slick-prev:before,
        // .slick-next:before {
        //   color: black !important;
        // }
      `}
      </style>

      <div className="py-5">
        <div className="w-100 partial-background">
          <div className="container">
            <h1 className="pt-4 pb-4 tw-text-white">
              {intl.formatMessage(TestimonialMessages.header)}
            </h1>
          </div>
        </div>
        <div className="tw-w-full tw-flex tw-items-center tw-h-[60vh] md:tw-h-[50vh]">
          <div className="tw-w-full tw-max-w-6xl tw-mx-auto tw-px-4 sm:tw-px-6 lg:tw-px-8">
              <Slider {...settings}>
                {testimonialsData.map((testimonial) => (
                  <div key={testimonial.author} className="px-2 tw-h-72 sm:tw-h-48 tw-text-center tw-text-black">
                    <blockquote className="tw-mx-auto">
                      <p className="tw-mb-4 tw-text-2xl">
                        {`"${testimonial.quote}"`}
                      </p>
                      <footer className="tw-text-xl tw-text-gray-500">
                        {testimonial.author}
                      </footer>
                    </blockquote>
                  </div>
                ))}
              </Slider>
          </div>
        </div>
      </div>
    </>
  );
}

export default Testimonials;

"use strict";

const { getStrings } = require("./hbs-helpers");

const getFooterLinks = (args) => {
  const locales = args.data.root.req.supportedLocales;
  const footerLinks = [
    {
      title: "About Firefox Monitor",
      stringId: "about-firefox-monitor",
      href: "/about",
    },
    {
      title: "Frequently Asked Questions",
      stringId: "faq",
      href: "/faq",
    },
    {
      title: "Terms & Privacy",
      stringId: "terms-and-privacy",
      href: "/termsandprivacy",
    },
    {
      title: "Mozilla.org",
      stringId: "mozilla-dot-org",
      href: "https://www.mozilla.org",
      openNewWindow: "",
    },
  ];

  return getStrings(footerLinks, locales);
};

module.exports = {
  getFooterLinks,
};

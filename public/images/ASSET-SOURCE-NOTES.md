# Source Image Manifest

All article image mappings used by the application point to public image assets on the primary source domain `shariahinvestments.in`.

## Verified article mappings

| Article | Image |
| --- | --- |
| Is Gold Still a Good Investment in 2026? | `https://shariahinvestments.in/wp-content/uploads/2018/06/demo-image-00004-380x220.jpg` |
| Difference Between Conventional and Islamic Finance | `https://shariahinvestments.in/wp-content/uploads/2019/11/1707470213156-380x220.webp` |
| What Are Shariah-Compliant Investments? | `https://shariahinvestments.in/wp-content/uploads/2018/06/demo-image-00004-380x220.jpg` |
| Common Myths About Halal Investing—Debunked | `https://shariahinvestments.in/wp-content/uploads/2019/11/Islamic_finance_and_ethical_banking-min-380x220.png` |
| Key Principles of Islamic Finance | `https://shariahinvestments.in/wp-content/uploads/2018/12/demo-image-00002-380x220.jpg` |
| How to Screen for Halal Stocks | `https://shariahinvestments.in/wp-content/uploads/2018/06/demo-image-00001-380x220.jpg` |
| How to Start Investing Islamically | `https://shariahinvestments.in/wp-content/uploads/2018/06/demo-image-00004-380x220.jpg` |
| What is Financial Wellbeing – And Why Should We Care? | `https://shariahinvestments.in/wp-content/uploads/2018/04/demo-image-00006-380x220.jpg` |
| Gold article inline chart | `https://shariahinvestments.in/wp-content/uploads/2026/09/image.png` |

The October 19, 2019 article **How to achive Financial Well Bieng -Being Shariah Compliant** did not expose a featured image in the public category/archive listing available during verification. Its article record therefore carries an explicit `imageStatus` instead of an invented asset.

## Local asset strategy

The required directory structure is present:

```text
public/images/
├── articles/
├── branding/
└── decorative/
```

The sandbox could not download the source-hosted binaries because outbound DNS/network access was unavailable. The application therefore references the verified public source-hosted images directly. When local vendoring becomes possible, the URLs can be replaced in `src/data/articles.js` without changing any UI component.

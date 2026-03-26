# Restaurant & F&B WhatsApp Ordering Deep Dive

## The commission problem

### UAE
| Platform | Commission | Notes |
|----------|-----------|-------|
| Talabat | 15-35% | Market leader ~50% share |
| Deliveroo | 20-35% | Strong in premium/urban |
| Noon Food | 15-25% | Aggressive pricing |
| Careem | 15-30% | Integrated super-app |

- 68% of UAE restaurant operators consider commissions "unsustainable" (UAE Restaurant Group 2023)
- AED 100 order on Talabat nets AED 65-75 after commission + packaging + fees

### Germany
| Platform | Commission | Notes |
|----------|-----------|-------|
| Lieferando | 13-30% | Dominant. 13% pickup, 30% delivery |
| Wolt | 20-30% | Growing post-DoorDash acquisition |
| Uber Eats | 15-30% | Smaller market share |

- DEHOGA repeatedly criticized commissions as "disproportionate"
- 72% of German operators want to reduce aggregator dependence (Gastromatic 2023)
- "Lieferando alternatives" search trend grew significantly 2021-2024

## Direct ordering economics

### Average order values
| Channel | UAE (AED) | Germany (EUR) |
|---------|-----------|---------------|
| Aggregator apps | 55-75 | 22-28 |
| Direct WhatsApp | 70-95 | 26-34 |
| Phone | 60-80 | 24-30 |

WhatsApp ordering shows **15-25% higher AOV** vs aggregators because:
- No competitor restaurants displayed side-by-side
- Conversational upselling is natural in chat
- No platform-imposed minimum order thresholds

### Margin comparison (example)
| Metric | Aggregator | Direct WhatsApp |
|--------|-----------|-----------------|
| Gross order | AED 70 | AED 85 |
| Platform commission | 25% (~AED 17.5) | 0% (or 3-5% SaaS) |
| Net to restaurant | ~70.7% | ~80-83% |

**Restaurants retain 10-15 percentage points more per order** on direct WhatsApp.

## Case studies
- **Burger King Brazil**: 3x higher conversion vs mobile app
- **KFC South Africa**: 30,000 orders in first month via WhatsApp
- **India small restaurants**: 40% of orders shifted to WhatsApp within 6 months
- **UAE cloud kitchens**: 25-30% reduction in customer acquisition cost
- **German pizza chain (NRW)**: 18% of orders migrated to WhatsApp in 4 months; AOV EUR 4-5 higher

## Tech adoption rates
### UAE
- POS adoption: ~80% in Dubai/Abu Dhabi
- QR menu adoption: 60-70% of dine-in restaurants
- WhatsApp Business account: 30-40% of restaurants
- **Automated WhatsApp ordering: fewer than 5%**

### Germany
- POS adoption: ~65%
- Online ordering: ~45% (mostly via Lieferando)
- WhatsApp Business account: 15-25%
- **Automated WhatsApp ordering: less than 2%**

## Existing WhatsApp ordering solutions

| Solution | Pricing | Gap |
|----------|---------|-----|
| ChatFood (UAE) | $99-299/mo | Not true conversational AI |
| Orderli | Per-order or subscription | Basic menu link sharing |
| Yumzi | from ~$49/mo | QR-to-WhatsApp, basic |
| Foodics (Saudi/UAE) | $200+/mo | Full restaurant OS, enterprise |

### What's missing
1. True conversational AI ordering ("I want 2 margherita pizzas and a Coke")
2. AI-driven upselling and personalization
3. Loyalty and retention features
4. Multilingual support (Arabic, English, Hindi, Urdu, Turkish, German)
5. Learning customer preferences over time

## The math that sells itself
A restaurant doing 50 delivery orders/day at AED 70 AOV:
- Aggregator commissions at 25% = **AED 875/day = AED 26,250/month**
- Switching half to direct WhatsApp (SaaS cost ~AED 500-1000/mo) = **saves AED 12,000-13,000/month**

## Addressable market
- UAE: ~25,000 restaurants, ~$2.8B online food delivery market
- Germany: ~200,000 restaurants, ~EUR 8-9B online food delivery market

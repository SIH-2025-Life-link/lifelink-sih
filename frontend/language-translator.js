// Language Translation System for LifeLink
class LanguageTranslator {
    constructor() {
        this.currentLanguage = localStorage.getItem('lifelink-language') || 'en';
        this.translations = {
            // Navigation
            'nav.home': {
                en: 'Home',
                hi: 'होम'
            },
            'nav.about': {
                en: 'About Us',
                hi: 'हमारे बारे में'
            },
            'nav.add': {
                en: 'Add Relief',
                hi: 'राहत जोड़ें'
            },
            'nav.check': {
                en: 'Check Relief',
                hi: 'राहत जांचें'
            },
            'nav.audit': {
                en: 'Audit Trail',
                hi: 'ऑडिट ट्रेल'
            },

            // Hero Section
            'hero.title': {
                en: 'LifeLink',
                hi: 'लाइफलिंक'
            },
            'hero.tagline': {
                en: 'Transparent Disaster Relief Tracking using Blockchain',
                hi: 'ब्लॉकचेन का उपयोग करके पारदर्शी आपदा राहत ट्रैकिंग'
            },
            'hero.getStarted': {
                en: 'Get Started',
                hi: 'शुरू करें'
            },

            // Values Section
            'values.title': {
                en: 'Our Core Values',
                hi: 'हमारे मुख्य मूल्य'
            },
            'values.transparency': {
                en: 'Transparency',
                hi: 'पारदर्शिता'
            },
            'values.transparencyDesc': {
                en: 'Every relief operation is tracked on blockchain for trust and accountability.',
                hi: 'विश्वास और जवाबदेही के लिए प्रत्येक राहत कार्य को ब्लॉकचेन पर ट्रैक किया जाता है।'
            },
            'values.efficiency': {
                en: 'Efficiency',
                hi: 'दक्षता'
            },
            'values.efficiencyDesc': {
                en: 'Ensure timely and fair distribution of aid during disasters.',
                hi: 'आपदाओं के दौरान सहायता का समय पर और निष्पक्ष वितरण सुनिश्चित करें।'
            },
            'values.impact': {
                en: 'Impact',
                hi: 'प्रभाव'
            },
            'values.impactDesc': {
                en: 'Empowering citizens and NGOs with reliable, real-time information.',
                hi: 'विश्वसनीय, वास्तविक समय की जानकारी के साथ नागरिकों और एनजीओ को सशक्त बनाना।'
            },

            // Statistics Section
            'stats.title': {
                en: 'Live Statistics',
                hi: 'लाइव आंकड़े'
            },
            'stats.totalDonations': {
                en: 'Total Donations',
                hi: 'कुल दान'
            },
            'stats.activeSupplies': {
                en: 'Active Supplies',
                hi: 'सक्रिय आपूर्ति'
            },
            'stats.completionRate': {
                en: 'Completion Rate',
                hi: 'पूर्णता दर'
            },
            'stats.nextUpdate': {
                en: 'Next update in',
                hi: 'अगला अपडेट'
            },
            'stats.seconds': {
                en: 'seconds',
                hi: 'सेकंड'
            },
            'stats.refreshNow': {
                en: 'Refresh Now',
                hi: 'अभी रीफ्रेश करें'
            },

            // Audit Trail Section
            'audit.title': {
                en: 'Recent Transactions',
                hi: 'हाल के लेनदेन'
            },
            'audit.search': {
                en: 'Search transactions...',
                hi: 'लेनदेन खोजें...'
            },
            'audit.allTime': {
                en: 'All Time',
                hi: 'सभी समय'
            },
            'audit.today': {
                en: 'Today',
                hi: 'आज'
            },
            'audit.thisWeek': {
                en: 'This Week',
                hi: 'इस सप्ताह'
            },
            'audit.thisMonth': {
                en: 'This Month',
                hi: 'इस महीने'
            },
            'audit.donations': {
                en: 'Donations',
                hi: 'दान'
            },
            'audit.supplies': {
                en: 'Supplies',
                hi: 'आपूर्ति'
            },
            'audit.completed': {
                en: 'Completed',
                hi: 'पूर्ण'
            },
            'audit.pending': {
                en: 'Pending',
                hi: 'लंबित'
            },
            'audit.inTransit': {
                en: 'In Transit',
                hi: 'रास्ते में'
            },
            'audit.blockchainVerified': {
                en: 'Blockchain Verified',
                hi: 'ब्लॉकचेन सत्यापित'
            },

            // About Page
            'about.title': {
                en: 'About LifeLink',
                hi: 'लाइफलिंक के बारे में'
            },
            'about.tagline': {
                en: 'Dedicated to Transparent and Accountable Disaster Relief',
                hi: 'पारदर्शी और जवाबदेह आपदा राहत के लिए समर्पित'
            },
            'about.team': {
                en: 'Meet Our Team',
                hi: 'हमारी टीम से मिलें'
            },
            'about.intro': {
                en: 'LifeLink is a student-driven initiative dedicated to making disaster relief transparent and accountable. We leverage blockchain technology to ensure aid reaches those who need it most, and that every transaction is traceable.',
                hi: 'लाइफलिंक एक छात्र-चालित पहल है जो आपदा राहत को पारदर्शी और जवाबदेह बनाने के लिए समर्पित है। हम ब्लॉकचेन तकनीक का लाभ उठाते हैं ताकि सहायता उन लोगों तक पहुंचे जिन्हें इसकी सबसे ज्यादा जरूरत है, और हर लेनदेन ट्रेसेबल हो।'
            },

            // Footer
            'footer.copyright': {
                en: '© 2025 LifeLink. All rights reserved.',
                hi: '© 2025 लाइफलिंक। सभी अधिकार सुरक्षित।'
            },

            'add.title': {
                en: 'Add Relief',
                hi: 'राहत जोड़ें'
            },
            'add.subtitle': {
                en: 'Submit relief resource details here',
                hi: 'यहां राहत संसाधन विवरण सबमिट करें'
            },
            'add.formTitle': {
                en: 'Relief Submission Form',
                hi: 'राहत सबमिशन फॉर्म'
            },
            'add.formSubtitle': {
                en: 'Help those in need by providing relief resources',
                hi: 'राहत संसाधन प्रदान करके जरूरतमंदों की मदद करें'
            },
            'add.importantNotice': {
                en: 'Important Notice',
                hi: 'महत्वपूर्ण सूचना'
            },
            'add.importantNoticeDesc': {
                en: 'This form is for official relief submissions only. Please review all details carefully — once submitted, your entry cannot be cancelled.',
                hi: 'यह फॉर्म केवल आधिकारिक राहत सबमिशन के लिए है। कृपया सभी विवरणों की सावधानीपूर्वक समीक्षा करें — एक बार सबमिट करने के बाद, आपकी प्रविष्टि रद्द नहीं की जा सकती।'
            },
            'add.successMessage': {
                en: 'Relief details submitted successfully!',
                hi: 'राहत विवरण सफलतापूर्वक सबमिट किया गया!'
            },
            'add.errorMessage': {
                en: 'Error submitting relief details. Please try again.',
                hi: 'राहत विवरण सबमिट करने में त्रुटि। कृपया पुनः प्रयास करें।'
            },
            'add.trackRelief': {
                en: 'Track Your Relief',
                hi: 'अपनी राहत ट्रैक करें'
            },
            'add.trackReliefDesc': {
                en: 'Use these credentials on the Check Relief page to view live updates.',
                hi: 'लाइव अपडेट देखने के लिए चेक राहत पृष्ठ पर इन क्रेडेंशियल्स का उपयोग करें।'
            },
            'add.idLabel': {
                en: 'ID',
                hi: 'आईडी'
            },
            'add.passwordLabel': {
                en: 'Password',
                hi: 'पासवर्ड'
            },
            'add.copyBtn': {
                en: 'Copy',
                hi: 'कॉपी करें'
            },
            'add.goToCheckRelief': {
                en: 'Go to Check Relief →',
                hi: 'चेक राहत पर जाएं →'
            },
            'add.reliefIdTitle': {
                en: 'Your Relief ID',
                hi: 'आपकी राहत आईडी'
            },
            'add.reliefIdDesc': {
                en: 'Save these credentials to track your relief status',
                hi: 'अपनी राहत स्थिति ट्रैक करने के लिए इन क्रेडेंशियल्स को सहेजें'
            },
            'add.reliefIdLabel': {
                en: 'Relief ID',
                hi: 'राहत आईडी'
            },
            'add.copyIdBtn': {
                en: 'Copy ID',
                hi: 'आईडी कॉपी करें'
            },
            'add.copyPasswordBtn': {
                en: 'Copy Password',
                hi: 'पासवर्ड कॉपी करें'
            },
            'add.trackReliefStatus': {
                en: 'Track Relief Status',
                hi: 'राहत स्थिति ट्रैक करें'
            },
            'add.printBtn': {
                en: 'Print',
                hi: 'प्रिंट करें'
            },
            'add.reliefTypeLabel': {
                en: 'Relief Type',
                hi: 'राहत प्रकार'
            },
            'add.selectReliefType': {
                en: 'Select relief type...',
                hi: 'राहत प्रकार चुनें...'
            },
            'add.foodWater': {
                en: 'Food & Water',
                hi: 'भोजन और पानी'
            },
            'add.shelter': {
                en: 'Shelter',
                hi: 'आश्रय'
            },
            'add.medical': {
                en: 'Medical Supplies',
                hi: 'चिकित्सा आपूर्ति'
            },
            'add.clothing': {
                en: 'Clothing',
                hi: 'कपड़े'
            },
            'add.other': {
                en: 'Other',
                hi: 'अन्य'
            },
            'add.locationLabel': {
                en: 'Location',
                hi: 'स्थान'
            },
            'add.contactLabel': {
                en: 'Contact Information',
                hi: 'संपर्क जानकारी'
            },
            'add.quantityLabel': {
                en: 'Quantity/Capacity',
                hi: 'मात्रा/क्षमता'
            },
            'add.detailsLabel': {
                en: 'Additional Details',
                hi: 'अतिरिक्त विवरण'
            },
            'add.submitBtn': {
                en: 'Submit Relief Details',
                hi: 'राहत विवरण सबमिट करें'
            },
            'add.formNote': {
                en: 'All fields marked with * are required. Your contact information will only be shared with verified relief seekers.',
                hi: 'सभी फ़ील्ड जिन पर * चिह्न है आवश्यक हैं। आपकी संपर्क जानकारी केवल सत्यापित राहत चाहने वालों के साथ साझा की जाएगी।'
            },

            // Check Page
            'check.title': {
                en: 'Relief Verification & Audit',
                hi: 'राहत सत्यापन और ऑडिट'
            },
            'check.loginTitle': {
                en: 'Secure Login',
                hi: 'सुरक्षित लॉगिन'
            },
            'check.usernameLabel': {
                en: 'Username',
                hi: 'उपयोगकर्ता नाम'
            },
            'check.passwordLabel': {
                en: 'Password',
                hi: 'पासवर्ड'
            },
            'check.loginBtn': {
                en: 'Login',
                hi: 'लॉगिन'
            },
            'check.verifyTitle': {
                en: 'Verify Relief Record',
                hi: 'राहत रिकॉर्ड सत्यापित करें'
            },
            'check.txHashLabel': {
                en: 'Transaction Hash',
                hi: 'लेनदेन हैश'
            },
            'check.verifyBtn': {
                en: 'Verify',
                hi: 'सत्यापित करें'
            },
            'check.auditTitle': {
                en: 'Audit Trail',
                hi: 'ऑडिट ट्रेल'
            },
            'check.loadAuditBtn': {
                en: 'Load Audit Trail',
                hi: 'ऑडिट ट्रेल लोड करें'
            },

            // Funds Page
            'funds.title': {
                en: 'Funds Portal',
                hi: 'फंड्स पोर्टल'
            },
            'funds.subtitle': {
                en: 'Secure Donations for Disaster Relief',
                hi: 'आपदा राहत के लिए सुरक्षित दान'
            },
            'funds.initSession': {
                en: '1. Initialize Secure Session',
                hi: '1. सुरक्षित सत्र प्रारंभ करें'
            },
            'funds.userIdPlaceholder': {
                en: 'Enter your User ID',
                hi: 'अपनी उपयोगकर्ता आईडी दर्ज करें'
            },
            'funds.startSession': {
                en: 'Start Secure Session',
                hi: 'सुरक्षित सत्र प्रारंभ करें'
            },
            'funds.donate': {
                en: '2. Donate',
                hi: '2. दान करें'
            },
            'funds.amountPlaceholder': {
                en: 'Amount (INR)',
                hi: 'राशि (INR)'
            },
            'funds.purposePlaceholder': {
                en: 'Purpose (optional)',
                hi: 'उद्देश्य (वैकल्पिक)'
            },
            'funds.namePlaceholder': {
                en: 'Your Name',
                hi: 'आपका नाम'
            },
            'funds.emailPlaceholder': {
                en: 'Your Email',
                hi: 'आपका ईमेल'
            },
            'funds.donateBtn': {
                en: 'Donate',
                hi: 'दान करें'
            },
            'funds.viewLedger': {
                en: '3. View Ledger (for demo)',
                hi: '3. लेजर देखें (डेमो के लिए)'
            },
            'funds.viewLedgerBtn': {
                en: 'View All Donations',
                hi: 'सभी दान देखें'
            },

            // Feedback Page
            'feedback.title': {
                en: 'Feedback & Grievances',
                hi: 'प्रतिक्रिया और शिकायतें'
            },
            'feedback.subtitle': {
                en: 'Report issues, send suggestions, or share your experience.',
                hi: 'समस्याओं की रिपोर्ट करें, सुझाव भेजें, या अपना अनुभव साझा करें।'
            },
            'feedback.formTitle': {
                en: 'Tell Us What Happened',
                hi: 'हमें बताएं क्या हुआ'
            },
            'feedback.formDesc': {
                en: 'We use your reports to improve relief operations and transparency.',
                hi: 'हम राहत कार्यों और पारदर्शिता में सुधार के लिए आपकी रिपोर्ट का उपयोग करते हैं।'
            },
            'feedback.success': {
                en: 'Thanks! Your message has been submitted.',
                hi: 'धन्यवाद! आपका संदेश सबमिट कर दिया गया है।'
            },
            'feedback.error': {
                en: 'Could not submit. Saved locally and will sync later.',
                hi: 'सबमिट नहीं किया जा सका। स्थानीय रूप से सहेजा गया और बाद में सिंक किया जाएगा।'
            },
            'feedback.nameLabel': {
                en: 'Your Name (optional)',
                hi: 'आपका नाम (वैकल्पिक)'
            },
            'feedback.contactLabel': {
                en: 'Contact (phone or email)',
                hi: 'संपर्क (फोन या ईमेल)'
            },
            'feedback.categoryLabel': {
                en: 'Category',
                hi: 'श्रेणी'
            },
            'feedback.selectCategory': {
                en: 'Select...',
                hi: 'चुनें...'
            },
            'feedback.issue': {
                en: 'Issue / Complaint',
                hi: 'समस्या / शिकायत'
            },
            'feedback.suggestion': {
                en: 'Suggestion',
                hi: 'सुझाव'
            },
            'feedback.appreciation': {
                en: 'Appreciation',
                hi: 'प्रशंसा'
            },
            'feedback.messageLabel': {
                en: 'Message',
                hi: 'संदेश'
            },
            'feedback.submitBtn': {
                en: 'Submit',
                hi: 'सबमिट करें'
            },
            'feedback.note': {
                en: 'We never share your contact publicly. Sensitive data is handled securely.',
                hi: 'हम आपकी संपर्क जानकारी सार्वजनिक रूप से कभी साझा नहीं करते। संवेदनशील डेटा को सुरक्षित रूप से संभाला जाता है।'
            },

            // Language Toggle
            'lang.english': {
                en: 'EN',
                hi: 'अंग्रेजी'
            },
            'lang.hindi': {
                en: 'HI',
                hi: 'हिंदी'
            }
        };

        this.init();
    }

    init() {
        this.createLanguageToggle();
        this.translatePage();
        this.bindEvents();
    }

    createLanguageToggle() {
        const navbar = document.querySelector('.navbar nav');
        if (!navbar) return;

        const languageToggle = document.createElement('div');
        languageToggle.className = 'language-toggle';
        languageToggle.innerHTML = `
            <div class="toggle-container">
                <span class="lang-label" data-key="lang.english">EN</span>
                <label class="toggle-switch">
                    <input type="checkbox" ${this.currentLanguage === 'hi' ? 'checked' : ''}>
                    <span class="slider"></span>
                </label>
                <span class="lang-label" data-key="lang.hindi">HI</span>
            </div>
        `;

        // Insert before the navigation menu
        const navUl = navbar.querySelector('ul');
        if (navUl) {
            navbar.insertBefore(languageToggle, navUl);
        }
    }

    bindEvents() {
        const toggleSwitch = document.querySelector('.toggle-switch input');
        if (toggleSwitch) {
            toggleSwitch.addEventListener('change', (e) => {
                this.currentLanguage = e.target.checked ? 'hi' : 'en';
                localStorage.setItem('lifelink-language', this.currentLanguage);
                this.translatePage();
            });
        }
    }

    translatePage() {
        // Translate elements with data-key attributes
        document.querySelectorAll('[data-key]').forEach(element => {
            const key = element.getAttribute('data-key');
            if (this.translations[key]) {
                const translation = this.translations[key][this.currentLanguage];
                if (translation) {
                    element.textContent = translation;
                }
            }
        });

        // Update document language attribute
        document.documentElement.lang = this.currentLanguage;

        // Update page title for specific pages
        this.updatePageTitle();
    }

    updatePageTitle() {
        const titleMap = {
            'index.html': {
                en: 'LifeLink - Transparent Disaster Relief',
                hi: 'लाइफलिंक - पारदर्शी आपदा राहत'
            },
            'about.html': {
                en: 'About Us - LifeLink',
                hi: 'हमारे बारे में - लाइफलिंक'
            },
            'add.html': {
                en: 'Add Relief - LifeLink',
                hi: 'राहत जोड़ें - लाइफलिंक'
            },
            'check.html': {
                en: 'Check Relief - LifeLink',
                hi: 'राहत जांचें - लाइफलिंक'
            }
        };

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (titleMap[currentPage]) {
            document.title = titleMap[currentPage][this.currentLanguage];
        }
    }

    getTranslation(key) {
        return this.translations[key] ? this.translations[key][this.currentLanguage] : key;
    }
}

// Initialize translator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.translator = new LanguageTranslator();
});

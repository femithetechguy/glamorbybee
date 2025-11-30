// ============================================
// INSTAGRAM GALLERY MODULE
// Uses Instafeed.js to fetch and display
// Instagram posts in a responsive grid
// ============================================

console.log('📸 Instagram Gallery Module - Starting load');

const InstagramGallery = {
    // Configuration
    config: {
        username: 'glamor_bybee',
        containerId: 'instafeed',
        limit: 12,
        sortBy: 'most-recent'
    },

    // Initialize the gallery
    init() {
        console.log('📸 Instagram Gallery Module - Initializing');
        console.log('   Container ID:', this.config.containerId);
        console.log('   Username:', this.config.username);
        
        // Check if Instafeed is available
        console.log('🔍 Checking for Instafeed library...');
        console.log('   window.Instafeed:', typeof window.Instafeed);
        console.log('   Instafeed:', typeof Instafeed);
        
        if (typeof Instafeed === 'undefined') {
            console.warn('⚠️ Instafeed library not loaded yet, retrying in 500ms...');
            setTimeout(() => this.init(), 500);
            return;
        }

        console.log('✓ Instafeed library loaded successfully');
        console.log('  Instafeed type:', typeof Instafeed);
        console.log('  Instafeed constructor:', Instafeed.constructor.name);

        // Create and start the feed
        this.createFeed();
    },

    // Create the Instafeed instance
    createFeed() {
        try {
            console.log('🔧 Creating Instafeed instance...');
            
            const accessToken = this.getAccessToken();
            
            const config = {
                accessToken: accessToken,
                limit: this.config.limit,
                sortBy: this.config.sortBy,
                target: this.config.containerId,
                template: this.getTemplate(),
                transform: (item) => this.transformItem(item),
                after: () => this.onFeedReady(),
                error: (err) => this.handleError(err)
            };
            
            console.log('📋 Instafeed config:', {
                hasAccessToken: accessToken && accessToken.length > 0,
                limit: config.limit,
                sortBy: config.sortBy,
                target: config.target,
                hasTemplate: !!config.template,
                hasTransform: !!config.transform,
                hasAfter: !!config.after,
                hasError: !!config.error
            });

            const feed = new Instafeed(config);

            console.log('🚀 Starting Instagram Feed...');
            console.log('   Feed object created:', !!feed);
            feed.run();
            console.log('✓ Instagram Feed run() called successfully');
        } catch (error) {
            console.error('❌ Error initializing Instafeed:', error);
            console.error('   Error name:', error.name);
            console.error('   Error message:', error.message);
            console.error('   Stack:', error.stack);
            this.showFallback();
        }
    },

    // Get access token for public Instagram posts
    getAccessToken() {
        console.log('🔐 Checking for Instagram API token...');
        // Instafeed.js v2 needs an access token for the Graph API
        // For testing without a token, the library should handle the error gracefully
        return '';
    },

    // HTML template for each post
    getTemplate() {
        console.log('📐 Using Instagram post template');
        return `
            <a href="{{link}}" target="_blank" class="instagram-post" title="View on Instagram">
                <img src="{{image}}" alt="Instagram Post" class="instagram-post-image" loading="lazy">
                <div class="instagram-post-overlay">
                    <div class="instagram-post-info">
                        <i class="bi bi-heart-fill"></i>
                        <span class="instagram-like-count">{{likes}}</span>
                    </div>
                </div>
            </a>
        `;
    },

    // Transform API response data
    transformItem(item) {
        console.log('🔄 Transforming Instagram item:', {
            mediaType: item.media_type,
            hasImage: !!item.media_url || !!item.thumbnail_url,
            hasCaption: !!item.caption,
            likeCount: item.like_count
        });
        
        return {
            image: item.media_type === 'IMAGE' ? item.media_url : item.thumbnail_url,
            link: item.permalink,
            likes: this.formatNumber(item.like_count || 0),
            caption: item.caption || ''
        };
    },

    // Format large numbers (1000 -> 1K)
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },

    // Callback when feed is ready
    onFeedReady() {
        console.log('✅ Instagram Gallery loaded successfully');
        
        const posts = document.querySelectorAll('.instagram-post');
        console.log('   Posts rendered:', posts.length);
        
        this.enhancePostInteractions();
    },

    // Add hover effects and interactions
    enhancePostInteractions() {
        const posts = document.querySelectorAll('.instagram-post');
        console.log('🎨 Enhancing post interactions for', posts.length, 'posts');
        
        posts.forEach((post, index) => {
            // Add smooth hover animation
            post.addEventListener('mouseenter', () => {
                post.style.transform = 'scale(1.02)';
            });

            post.addEventListener('mouseleave', () => {
                post.style.transform = 'scale(1)';
            });

            // Mobile touch feedback
            post.addEventListener('touchstart', () => {
                post.style.opacity = '0.95';
            });

            post.addEventListener('touchend', () => {
                post.style.opacity = '1';
            });
        });
        
        console.log('✓ Post interactions enhanced');
    },

    // Handle errors
    handleError(err) {
        console.error('❌ Instagram Gallery Error:', err);
        console.error('   Error details:', {
            message: err.message || 'Unknown error',
            code: err.code || 'N/A',
            type: err.type || typeof err
        });
        
        console.log('📝 Possible causes:');
        console.log('   1. Missing or invalid API token');
        console.log('   2. Instagram account is private');
        console.log('   3. API rate limit exceeded');
        console.log('   4. Instagram username not found: @glamor_bybee');
        console.log('   5. Network connectivity issue');
        
        this.showFallback();
    },

    // Show fallback message if API fails
    showFallback() {
        const container = document.getElementById(this.config.containerId);
        console.log('🔌 Showing fallback message, container element:', !!container);
        
        if (container) {
            container.innerHTML = `
                <div class="instagram-fallback">
                    <i class="bi bi-exclamation-circle"></i>
                    <p>Unable to load Instagram posts at the moment.</p>
                    <a href="https://www.instagram.com/glamor_bybee/" target="_blank" class="btn btn-primary">
                        <i class="bi bi-instagram"></i> Visit Instagram
                    </a>
                </div>
            `;
            console.log('✓ Fallback message displayed');
        } else {
            console.error('❌ Container element not found:', this.config.containerId);
        }
    }
};

// Initialize when DOM is ready
console.log('📄 DOM readyState:', document.readyState);

function initializeGallery() {
    console.log('🎯 initializeGallery() called');
    console.log('📄 Current DOM readyState:', document.readyState);
    InstagramGallery.init();
}

if (document.readyState === 'loading') {
    console.log('⏳ DOM still loading, adding DOMContentLoaded listener...');
    document.addEventListener('DOMContentLoaded', initializeGallery);
} else if (document.readyState === 'interactive') {
    console.log('⏳ DOM interactive, waiting for complete state...');
    // DOM is interactive but not complete, still wait a bit
    setTimeout(initializeGallery, 100);
} else {
    console.log('✓ DOM already complete, initializing immediately');
    initializeGallery();
}

console.log('✓ Instagram Gallery Module loaded and initialization scheduled');


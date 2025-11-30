// ============================================
// INSTAGRAM GALLERY MODULE
// Uses Instafeed.js to fetch and display
// Instagram posts in a responsive grid
// ============================================

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
        
        // Wait for Instafeed to be available
        if (typeof Instafeed === 'undefined') {
            console.warn('⚠️ Instafeed library not loaded, retrying...');
            setTimeout(() => this.init(), 500);
            return;
        }

        // Create and start the feed
        this.createFeed();
    },

    // Create the Instafeed instance
    createFeed() {
        try {
            const feed = new Instafeed({
                accessToken: this.getAccessToken(),
                limit: this.config.limit,
                sortBy: this.config.sortBy,
                target: this.config.containerId,
                template: this.getTemplate(),
                transform: (item) => this.transformItem(item),
                after: () => this.onFeedReady(),
                error: (err) => this.handleError(err)
            });

            feed.run();
            console.log('✓ Instagram Feed started');
        } catch (error) {
            console.error('❌ Error initializing Instafeed:', error);
            this.showFallback();
        }
    },

    // Get access token for public Instagram posts
    getAccessToken() {
        // For public Instagram posts, you can use a public access token
        // or leave empty for public accounts
        return '';
    },

    // HTML template for each post
    getTemplate() {
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
        console.log('✓ Instagram Gallery loaded');
        this.enhancePostInteractions();
    },

    // Add hover effects and interactions
    enhancePostInteractions() {
        const posts = document.querySelectorAll('.instagram-post');
        
        posts.forEach(post => {
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
    },

    // Handle errors
    handleError(err) {
        console.error('❌ Instagram Gallery Error:', err);
        this.showFallback();
    },

    // Show fallback message if API fails
    showFallback() {
        const container = document.getElementById(this.config.containerId);
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
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => InstagramGallery.init());
} else {
    InstagramGallery.init();
}

console.log('✓ Instagram Gallery Module loaded');

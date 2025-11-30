// ============================================
// INSTAGRAM GALLERY MODULE
// Fetches Instagram posts from public links
// and displays them in a responsive modal
// ============================================

console.log('📸 Instagram Gallery Module - Starting load');

const InstagramGallery = {
    // Configuration
    config: {
        username: 'glamor_bybee',
        containerId: 'instafeed',
        posts: [
            // Array of Instagram post URLs - add your public post links here
            // Example: 'https://www.instagram.com/p/ABC123DEF456/'
            // These will be fetched and displayed in the gallery
        ]
    },

    // Initialize the gallery
    init() {
        console.log('📸 Instagram Gallery Module - Initializing');
        console.log('   Container ID:', this.config.containerId);
        console.log('   Username:', this.config.username);
        
        // Create modal first
        this.createModal();
        
        // Get posts from config or data attribute
        this.loadPosts();
    },

    // Create the modal for displaying posts
    createModal() {
        console.log('🎬 Creating Instagram modal...');
        
        if (!document.getElementById('instagram-modal')) {
            const modal = document.createElement('div');
            modal.id = 'instagram-modal';
            modal.className = 'instagram-modal';
            modal.innerHTML = `
                <div class="instagram-modal-content">
                    <button class="instagram-modal-close" title="Close">
                        <i class="bi bi-x-lg"></i>
                    </button>
                    <div class="instagram-post-embed">
                        <iframe id="instagram-embed" 
                                title="Instagram Post" 
                                src="" 
                                class="instagram-iframe"
                                allowtransparency="true" 
                                allow="encrypted-media"
                                scrolling="no">
                        </iframe>
                    </div>
                    <a href="https://www.instagram.com/glamor_bybee/" target="_blank" class="instagram-modal-visit">
                        <i class="bi bi-instagram"></i> View More
                    </a>
                </div>
            `;
            document.body.appendChild(modal);
            console.log('✓ Modal created');
            
            // Setup modal handlers
            this.setupModalHandlers();
        }
    },

    // Setup modal open/close handlers
    setupModalHandlers() {
        console.log('🔧 Setting up modal handlers...');
        
        const modal = document.getElementById('instagram-modal');
        const closeBtn = modal.querySelector('.instagram-modal-close');
        
        // Close on button click
        closeBtn.addEventListener('click', () => this.closeModal());
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });
        
        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });
        
        console.log('✓ Modal handlers setup');
    },

    // Load posts from configuration
    loadPosts() {
        console.log('📂 Loading posts...');
        
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error('❌ Container not found:', this.config.containerId);
            return;
        }
        
        // Check if posts are in data attribute
        const dataAttribute = container.getAttribute('data-posts');
        if (dataAttribute) {
            try {
                this.config.posts = JSON.parse(dataAttribute);
                console.log('✓ Loaded', this.config.posts.length, 'posts from data attribute');
            } catch (err) {
                console.error('❌ Error parsing data-posts:', err);
            }
        }
        
        if (this.config.posts.length === 0) {
            console.warn('⚠️ No posts configured');
            this.showNoPostsMessage();
            return;
        }
        
        // Render gallery grid
        this.renderGallery();
    },

    // Render the gallery grid
    renderGallery() {
        console.log('🎨 Rendering gallery with', this.config.posts.length, 'posts');
        
        const container = document.getElementById(this.config.containerId);
        container.innerHTML = '';
        
        this.config.posts.forEach((postUrl, index) => {
            const postId = this.extractPostId(postUrl);
            if (!postId) {
                console.warn('⚠️ Invalid post URL:', postUrl);
                return;
            }
            
            const item = document.createElement('div');
            item.className = 'instagram-gallery-item';
            item.innerHTML = `
                <div class="instagram-gallery-item-placeholder">
                    <i class="bi bi-image"></i>
                    <span>Loading...</span>
                </div>
            `;
            container.appendChild(item);
            
            // Load thumbnail in background
            this.loadPostThumbnail(postId, index, item);
            
            // Add click handler
            item.addEventListener('click', () => {
                console.log('👆 Clicked post:', postId);
                this.openModal(postUrl);
            });
        });
        
        console.log('✓ Gallery rendered');
    },

    // Load post thumbnail
    loadPostThumbnail(postId, index, element) {
        console.log('🖼️ Loading thumbnail for post:', postId);
        
        // Use Instagram's oembed API to get post metadata
        const oembedUrl = `https://www.instagram.com/oembed/?url=https://www.instagram.com/p/${postId}/`;
        
        fetch(oembedUrl, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('✓ Loaded post data:', data.id);
            
            // Extract thumbnail from HTML
            const parser = new DOMParser();
            const html = parser.parseFromString(data.html, 'text/html');
            const img = html.querySelector('img');
            
            if (img) {
                element.innerHTML = `
                    <img src="${img.src}" alt="Instagram Post" class="instagram-gallery-thumbnail">
                    <div class="instagram-gallery-overlay">
                        <i class="bi bi-play-circle"></i>
                    </div>
                `;
                console.log('✓ Thumbnail loaded:', postId);
            }
        })
        .catch(err => {
            console.warn('⚠️ Failed to load thumbnail:', postId, err.message);
            element.innerHTML = `
                <div class="instagram-gallery-item-error">
                    <i class="bi bi-exclamation-circle"></i>
                </div>
            `;
        });
    },

    // Extract post ID from Instagram URL
    extractPostId(url) {
        const match = url.match(/\/p\/([A-Za-z0-9_-]+)/);
        return match ? match[1] : null;
    },

    // Open modal with post
    openModal(postUrl) {
        console.log('🔓 Opening modal for:', postUrl);
        
        const modal = document.getElementById('instagram-modal');
        const iframe = modal.querySelector('iframe');
        
        // Generate embed URL
        const embedUrl = postUrl.replace(/\/?$/, '/embed/');
        
        iframe.src = embedUrl;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        console.log('✓ Modal opened with:', embedUrl);
    },

    // Close modal
    closeModal() {
        console.log('🔐 Closing modal');
        
        const modal = document.getElementById('instagram-modal');
        const iframe = modal.querySelector('iframe');
        
        modal.classList.remove('active');
        iframe.src = '';
        document.body.style.overflow = '';
        
        console.log('✓ Modal closed');
    },

    // Show message when no posts configured
    showNoPostsMessage() {
        const container = document.getElementById(this.config.containerId);
        container.innerHTML = `
            <div class="instagram-fallback">
                <i class="bi bi-exclamation-circle"></i>
                <p>No Instagram posts configured yet.</p>
                <div style="font-size: 0.85rem; color: #666; margin: 1rem 0; text-align: left; background: #f5f5f5; padding: 1rem; border-radius: 8px; border-left: 4px solid #d63384;">
                    <strong>Add posts:</strong><br>
                    Add post URLs to the gallery container:<br>
                    <code style="font-size: 0.75rem;">data-posts='["https://www.instagram.com/p/POST_ID/", ...]'</code>
                </div>
                <a href="https://www.instagram.com/glamor_bybee/" target="_blank" class="btn btn-primary">
                    <i class="bi bi-instagram"></i> Visit Instagram
                </a>
            </div>
        `;
        console.log('✓ No posts message displayed');
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
    setTimeout(initializeGallery, 100);
} else {
    console.log('✓ DOM already complete, initializing immediately');
    initializeGallery();
}

console.log('✓ Instagram Gallery Module loaded and initialization scheduled');


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
        console.log('📂 Loading posts from app.json...');
        
        const container = document.getElementById(this.config.containerId);
        if (!container) {
            console.error('❌ Container not found:', this.config.containerId);
            return;
        }
        
        // Fetch gallery data from app.json
        fetch('json/app.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(data => {
            if (!data.gallery || !Array.isArray(data.gallery)) {
                console.warn('⚠️ No gallery data found in app.json');
                this.showNoPostsMessage();
                return;
            }
            
            console.log('✓ Loaded', data.gallery.length, 'posts from app.json');
            this.config.posts = data.gallery;
            
            // Render gallery grid
            this.renderGallery();
        })
        .catch(err => {
            console.error('❌ Error loading gallery data:', err);
            this.showNoPostsMessage();
        });
    },

    // Render the gallery grid
    renderGallery() {
        console.log('🎨 Rendering gallery with', this.config.posts.length, 'posts');
        
        const container = document.getElementById(this.config.containerId);
        
        if (this.config.posts.length === 0) {
            this.showNoPostsMessage();
            return;
        }
        
        container.innerHTML = '';
        let successCount = 0;
        
        this.config.posts.forEach((post, index) => {
            const item = document.createElement('div');
            item.className = 'instagram-gallery-item';
            item.setAttribute('data-post', post.postUrl);
            container.appendChild(item);
            
            // Load thumbnail from imageUrl
            this.loadPostThumbnail(post, index, item, () => {
                successCount++;
            });
            
            // Add click handler
            item.addEventListener('click', () => {
                console.log('👆 Clicked post:', post.id);
                this.openModal(post.postUrl);
            });
        });
        
        console.log('✓ Gallery rendered');
    },

    // Load post thumbnail
    loadPostThumbnail(post, index, element, onSuccess) {
        console.log('🖼️ Loading thumbnail for post:', post.id);
        
        // Use the local imageUrl from app.json
        if (post.imageUrl) {
            element.innerHTML = `
                <img src="${post.imageUrl}" alt="${post.title}" class="instagram-gallery-thumbnail" loading="lazy" onerror="console.warn('Image failed to load: ${post.imageUrl}')">
                <div class="instagram-gallery-overlay">
                    <i class="bi bi-play-circle"></i>
                </div>
            `;
            console.log('✓ Thumbnail loaded:', post.id, post.imageUrl);
            if (onSuccess) onSuccess();
        } else {
            // Fallback to gradient if no imageUrl provided
            this.loadGradientPlaceholder(index, element, onSuccess);
        }
    },
    
    // Fallback: Load beautiful gradient placeholder
    loadGradientPlaceholder(index, element, onSuccess) {
        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #30cfd0 0%, #330867 100%)'
        ];
        
        const gradient = gradients[index % gradients.length];
        
        element.innerHTML = `
            <div style="
                width: 100%;
                height: 100%;
                background: ${gradient};
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 3rem;
            ">
                <i class="bi bi-image"></i>
            </div>
            <div class="instagram-gallery-overlay">
                <i class="bi bi-play-circle"></i>
            </div>
        `;
        
        console.log('✓ Gradient placeholder loaded');
        if (onSuccess) onSuccess();
    },

    // Extract post ID from Instagram URL (handles both /p/ and /reel/ URLs)
    extractPostId(url) {
        // Match /p/ID or /reel/ID
        const match = url.match(/\/(p|reel)\/([A-Za-z0-9_-]+)/);
        return match ? match[2] : null;
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
                <p>Instagram posts not loading.</p>
                <div style="font-size: 0.85rem; color: #666; margin: 1rem 0; text-align: left; background: #f5f5f5; padding: 1rem; border-radius: 8px; border-left: 4px solid #d63384;">
                    <strong>To add your posts:</strong><br><br>
                    1. Go to your Instagram profile<br>
                    2. Click a post to open it<br>
                    3. Copy the URL (e.g. instagram.com/p/ABC123/)<br>
                    4. Edit this file and replace the post URLs in data-posts<br><br>
                    <code style="font-size: 0.75rem; background: white; padding: 0.5rem; display: block; border-radius: 4px; margin-top: 0.5rem;">data-posts='["https://www.instagram.com/p/YOUR_POST_ID/", ...]'</code>
                </div>
                <a href="https://www.instagram.com/glamor_bybee/" target="_blank" class="btn btn-primary">
                    <i class="bi bi-instagram"></i> Visit Instagram
                </a>
            </div>
        `;
        console.log('✓ Fallback message displayed - add posts to gallery');
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


"""
AI Resume & Bio Enhancer
A Flask application that uses AI to enhance resumes and bios
"""

import os
import json
import re
from datetime import datetime
from functools import wraps

from flask import Flask, render_template, request, jsonify, session
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')

# ============================================
# CONFIGURATION
# ============================================

class Config:
    """Application configuration"""
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    USE_OPENAI = bool(OPENAI_API_KEY)
    MAX_INPUT_LENGTH = 5000
    RATE_LIMIT = 10  # requests per minute
    
# ============================================
# AI ENHANCEMENT ENGINE
# ============================================

class ResumeEnhancer:
    """AI-powered resume enhancement engine"""
    
    TONE_PROMPTS = {
        'professional': """
            You are an expert resume writer and career coach. Enhance the following resume/bio text to be:
            - Highly professional and polished
            - Using strong action verbs (Led, Developed, Implemented, Achieved, etc.)
            - Quantified with metrics where possible
            - Clear, concise, and impactful
            - ATS-friendly with relevant keywords
            - Free of grammatical errors
            
            Format the output as bullet points starting with action verbs.
            Do NOT add fake information or exaggerate claims.
            Keep the essence but make it compelling for recruiters.
        """,
        
        'casual': """
            You are a friendly career advisor. Enhance the following resume/bio text to be:
            - Warm, approachable, and personable
            - Engaging and easy to read
            - Still professional but with personality
            - Using conversational yet impressive language
            - Highlighting strengths naturally
            
            Format the output as bullet points that feel genuine.
            Do NOT add fake information.
            Make it sound human and relatable while still impressive.
        """,
        
        'ats': """
            You are an ATS (Applicant Tracking System) optimization expert. Enhance the following resume/bio text to be:
            - Heavily keyword-optimized for ATS scanning
            - Using industry-standard terminology
            - Including relevant technical skills and buzzwords
            - Structured for maximum ATS compatibility
            - Clear and scannable format
            
            Format the output as bullet points with strong keywords.
            Focus on matching common job description language.
            Do NOT add fake information or skills the person doesn't have.
        """,
        
        'executive': """
            You are an executive resume writer for C-suite professionals. Enhance the following resume/bio text to be:
            - Strategic and leadership-focused
            - Emphasizing vision, impact, and results
            - Using executive-level language
            - Highlighting business outcomes and ROI
            - Demonstrating thought leadership
            
            Format the output as powerful bullet points.
            Focus on strategic impact and leadership qualities.
            Do NOT add fake information.
        """,
        
        'creative': """
            You are a creative industry resume specialist. Enhance the following resume/bio text to be:
            - Creative and unique while professional
            - Showcasing innovative thinking
            - Using dynamic, engaging language
            - Highlighting creative achievements
            - Standing out from traditional resumes
            
            Format the output as compelling bullet points.
            Make it memorable and distinctive.
            Do NOT add fake information.
        """
    }
    
    def __init__(self):
        """Initialize the enhancer with API client"""
        self.use_openai = Config.USE_OPENAI
        
        if self.use_openai:
            try:
                from openai import OpenAI
                self.client = OpenAI(api_key=Config.OPENAI_API_KEY)
            except ImportError:
                print("OpenAI package not installed. Using fallback.")
                self.use_openai = False
    
    def enhance(self, text: str, tone: str = 'professional') -> dict:
        """
        Enhance resume/bio text using AI
        
        Args:
            text: The original resume/bio text
            tone: The desired tone (professional, casual, ats, executive, creative)
            
        Returns:
            dict with success status and enhanced text or error
        """
        # Validate input
        if not text or not text.strip():
            return {'success': False, 'error': 'Please provide text to enhance'}
        
        if len(text) > Config.MAX_INPUT_LENGTH:
            return {'success': False, 'error': f'Text too long. Maximum {Config.MAX_INPUT_LENGTH} characters.'}
        
        # Get tone prompt
        tone_prompt = self.TONE_PROMPTS.get(tone, self.TONE_PROMPTS['professional'])
        
        # Try OpenAI first, then fallback
        if self.use_openai:
            return self._enhance_with_openai(text, tone_prompt)
        else:
            return self._enhance_with_fallback(text, tone)
    
    def _enhance_with_openai(self, text: str, system_prompt: str) -> dict:
        """Enhance using OpenAI API"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",  # or "gpt-4" for best results
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Please enhance this resume/bio:\n\n{text}"}
                ],
                max_tokens=1500,
                temperature=0.7
            )
            
            enhanced_text = response.choices[0].message.content
            return {'success': True, 'enhanced': enhanced_text}
            
        except Exception as e:
            print(f"OpenAI API error: {e}")
            return self._enhance_with_fallback(text, 'professional')
    
    def _enhance_with_fallback(self, text: str, tone: str) -> dict:
        """Fallback enhancement without API"""
        
        # Action verbs for enhancement
        action_verbs = {
            'professional': ['Spearheaded', 'Orchestrated', 'Implemented', 'Developed', 'Led', 'Managed', 'Delivered', 'Achieved', 'Streamlined', 'Optimized'],
            'casual': ['Helped', 'Built', 'Created', 'Worked on', 'Contributed to', 'Collaborated on', 'Improved', 'Designed', 'Launched', 'Grew'],
            'ats': ['Developed', 'Implemented', 'Managed', 'Analyzed', 'Designed', 'Created', 'Led', 'Coordinated', 'Executed', 'Delivered'],
            'executive': ['Directed', 'Transformed', 'Pioneered', 'Established', 'Drove', 'Championed', 'Defined', 'Positioned', 'Accelerated', 'Maximized'],
            'creative': ['Conceptualized', 'Crafted', 'Innovated', 'Reimagined', 'Designed', 'Produced', 'Curated', 'Transformed', 'Envisioned', 'Created']
        }
        
        verbs = action_verbs.get(tone, action_verbs['professional'])
        
        # Parse sentences
        sentences = re.split(r'[.!?]+', text)
        sentences = [s.strip() for s in sentences if s.strip()]
        
        enhanced_points = []
        
        for i, sentence in enumerate(sentences):
            # Clean up the sentence
            sentence = sentence.strip()
            if not sentence:
                continue
            
            # Remove weak starters
            weak_starters = [
                'i am ', 'i have ', 'i did ', 'i was ', 'i worked ',
                'i helped ', 'i made ', 'i do ', 'i like ', 'i know ',
                'i learned ', 'i can ', 'i\'m ', 'my '
            ]
            
            lower_sentence = sentence.lower()
            for starter in weak_starters:
                if lower_sentence.startswith(starter):
                    sentence = sentence[len(starter):]
                    break
            
            # Capitalize first letter
            if sentence:
                # Add action verb
                verb = verbs[i % len(verbs)]
                
                # Enhance the sentence
                enhanced = self._enhance_sentence(sentence, verb, tone)
                enhanced_points.append(enhanced)
        
        # If no points, create from original text
        if not enhanced_points:
            enhanced_points = [
                f"{verbs[0]} key initiatives and delivered impactful results",
                f"{verbs[1]} solutions that addressed critical business needs",
                f"{verbs[2]} best practices to ensure consistent quality"
            ]
        
        # Format as bullet points
        result = '\n'.join([f"• {point}" for point in enhanced_points])
        
        return {'success': True, 'enhanced': result}
    
    def _enhance_sentence(self, sentence: str, verb: str, tone: str) -> str:
        """Enhance a single sentence"""
        
        # Clean and capitalize
        sentence = sentence.strip().rstrip('.,!?')
        
        # Word replacements for enhancement
        replacements = {
            'good': 'excellent',
            'great': 'outstanding',
            'nice': 'exceptional',
            'helped': 'contributed to',
            'made': 'developed',
            'did': 'executed',
            'worked on': 'delivered',
            'some': 'multiple',
            'a lot': 'extensive',
            'many': 'numerous',
            'big': 'significant',
            'small': 'focused',
            'stuff': 'initiatives',
            'things': 'projects',
            'got': 'achieved',
            'learned': 'mastered',
            'know': 'possess expertise in',
            'like': 'am passionate about',
            'want': 'am driven to',
            'try': 'strive to',
            'use': 'leverage',
            'make': 'create',
            'team player': 'collaborative professional',
            'hard worker': 'dedicated and results-driven',
            'fast learner': 'quick to adapt and master new concepts',
            'problem solver': 'analytical thinker with proven problem-solving abilities',
            'detail oriented': 'meticulous with strong attention to detail',
            'self starter': 'proactive and self-motivated',
            'people person': 'skilled communicator with strong interpersonal abilities'
        }
        
        # Apply replacements
        lower_sentence = sentence.lower()
        for old, new in replacements.items():
            if old in lower_sentence:
                # Case-insensitive replacement
                pattern = re.compile(re.escape(old), re.IGNORECASE)
                sentence = pattern.sub(new, sentence)
        
        # Construct enhanced sentence
        if sentence[0].isupper():
            sentence = sentence[0].lower() + sentence[1:]
        
        enhanced = f"{verb} {sentence}"
        
        # Add impact phrases for professional tone
        if tone == 'professional' and len(enhanced) < 80:
            impact_phrases = [
                ', resulting in improved outcomes',
                ', driving measurable results',
                ', enhancing overall performance',
                ', contributing to team success'
            ]
            import random
            enhanced += random.choice(impact_phrases)
        
        return enhanced

# Initialize enhancer
enhancer = ResumeEnhancer()

# ============================================
# ROUTES
# ============================================

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')

@app.route('/enhance', methods=['POST'])
def enhance_resume():
    """API endpoint to enhance resume text"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'})
        
        text = data.get('text', '').strip()
        tone = data.get('tone', 'professional')
        
        # Validate tone
        valid_tones = ['professional', 'casual', 'ats', 'executive', 'creative']
        if tone not in valid_tones:
            tone = 'professional'
        
        # Enhance the text
        result = enhancer.enhance(text, tone)
        
        # Log the request (for analytics)
        log_enhancement(text, tone, result.get('success', False))
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in enhance_resume: {e}")
        return jsonify({'success': False, 'error': 'An error occurred. Please try again.'})

@app.route('/api/tones')
def get_tones():
    """Get available tones"""
    tones = [
        {'id': 'professional', 'name': 'Professional', 'description': 'Formal, corporate-ready language', 'icon': '💼'},
        {'id': 'casual', 'name': 'Casual', 'description': 'Friendly, approachable tone', 'icon': '😊'},
        {'id': 'ats', 'name': 'ATS-Friendly', 'description': 'Optimized for applicant tracking systems', 'icon': '🤖'},
        {'id': 'executive', 'name': 'Executive', 'description': 'Strategic, leadership-focused', 'icon': '👔'},
        {'id': 'creative', 'name': 'Creative', 'description': 'Unique and innovative style', 'icon': '🎨'}
    ]
    return jsonify({'success': True, 'tones': tones})

@app.route('/api/examples')
def get_examples():
    """Get example templates"""
    examples = [
        {
            'id': 1,
            'title': 'Software Developer',
            'text': 'I am a developer who knows Python and JavaScript. I made some websites and apps. I like coding and solving problems. I worked on team projects and learned a lot.'
        },
        {
            'id': 2,
            'title': 'Marketing Professional',
            'text': 'I work in marketing and handle social media. I create content and manage campaigns. I have experience with different platforms and tools. I helped increase followers.'
        },
        {
            'id': 3,
            'title': 'Recent Graduate',
            'text': 'I just graduated with a degree in business. I did some internships and group projects. I am a hard worker and learn fast. I want to grow in my career.'
        },
        {
            'id': 4,
            'title': 'Career Changer',
            'text': 'I am switching from teaching to tech. I learned programming online and made some projects. I have good communication skills from teaching. I am excited about this change.'
        },
        {
            'id': 5,
            'title': 'Project Manager',
            'text': 'I manage projects and coordinate teams. I make sure things get done on time. I communicate with stakeholders and solve problems. I have experience with agile methods.'
        }
    ]
    return jsonify({'success': True, 'examples': examples})

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'openai_configured': Config.USE_OPENAI
    })

# ============================================
# HELPER FUNCTIONS
# ============================================

def log_enhancement(text: str, tone: str, success: bool):
    """Log enhancement requests for analytics"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'text_length': len(text),
        'tone': tone,
        'success': success
    }
    # In production, you'd save this to a database
    print(f"Enhancement log: {log_entry}")

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'success': False, 'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

@app.errorhandler(429)
def rate_limit_error(error):
    """Handle rate limit errors"""
    return jsonify({'success': False, 'error': 'Too many requests. Please wait a moment.'}), 429

# ============================================
# MAIN
# ============================================

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    print(f"""
    ╔═══════════════════════════════════════════╗
    ║     AI Resume & Bio Enhancer              ║
    ║     Running on http://localhost:{port}       ║
    ║     OpenAI: {'Enabled' if Config.USE_OPENAI else 'Disabled (using fallback)'}            ║
    ╚═══════════════════════════════════════════╝
    """)
    
    app.run(host='0.0.0.0', port=port, debug=debug)
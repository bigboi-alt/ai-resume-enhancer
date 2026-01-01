"""
AI Resume & Bio Enhancer
A Flask application that uses AI to enhance resumes and bios
"""

from flask import Flask, render_template, request, jsonify
from openai import OpenAI
import os
from dotenv import load_dotenv
import re

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Tone-specific prompts
TONE_PROMPTS = {
    'professional': """
        You are an expert resume writer. Enhance the following text to be highly professional.
        - Use strong action verbs (Led, Developed, Implemented, Achieved, Spearheaded)
        - Quantify achievements where possible
        - Keep it concise and impactful
        - Use industry-standard terminology
        - Make it sound confident but not arrogant
        - Format as clear bullet points
        - Do NOT add fake information or exaggerate
    """,
    'casual': """
        You are a friendly resume helper. Make the following text sound approachable yet impressive.
        - Keep the tone warm and personable
        - Use conversational but professional language
        - Highlight personality alongside skills
        - Make it relatable and human
        - Format as clear bullet points
        - Do NOT add fake information
    """,
    'ats-friendly': """
        You are an ATS (Applicant Tracking System) optimization expert.
        - Use keywords that ATS systems look for
        - Keep formatting simple and clean
        - Use standard section headers
        - Include relevant industry keywords
        - Avoid special characters and graphics descriptions
        - Use common job title variations
        - Format as clear bullet points
        - Do NOT add fake information
    """
}

def enhance_text(text: str, tone: str, content_type: str) -> dict:
    """
    Enhance resume or bio text using OpenAI API
    
    Args:
        text: The original text to enhance
        tone: The desired tone (professional, casual, ats-friendly)
        content_type: Either 'resume' or 'bio'
    
    Returns:
        Dictionary with enhanced text and bullet points
    """
    
    if not text or not text.strip():
        return {'error': 'Please provide some text to enhance'}
    
    tone_prompt = TONE_PROMPTS.get(tone, TONE_PROMPTS['professional'])
    
    if content_type == 'bio':
        type_instruction = """
            This is a personal bio/about me section.
            Create a compelling personal summary that:
            - Captures the person's essence in 3-5 sentences
            - Highlights key strengths and passions
            - Is memorable and engaging
            Also provide bullet point highlights.
        """
    else:
        type_instruction = """
            This is resume content.
            Transform it into powerful bullet points that:
            - Start with strong action verbs
            - Show impact and results
            - Are scannable and clear
        """
    
    full_prompt = f"""
        {tone_prompt}
        
        {type_instruction}
        
        Original text:
        {text}
        
        Please provide:
        1. An enhanced paragraph version (2-4 sentences)
        2. 4-6 bullet points highlighting key aspects
        
        Format your response exactly like this:
        ENHANCED:
        [Your enhanced paragraph here]
        
        BULLETS:
        • [Bullet point 1]
        • [Bullet point 2]
        • [Bullet point 3]
        • [Bullet point 4]
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume and professional bio writer. You enhance text while keeping it truthful and authentic."
                },
                {
                    "role": "user",
                    "content": full_prompt
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        result = response.choices[0].message.content
        
        # Parse the response
        enhanced = ""
        bullets = []
        
        if "ENHANCED:" in result and "BULLETS:" in result:
            parts = result.split("BULLETS:")
            enhanced_part = parts[0].replace("ENHANCED:", "").strip()
            bullets_part = parts[1].strip()
            
            enhanced = enhanced_part
            
            # Extract bullet points
            bullet_lines = bullets_part.split('\n')
            for line in bullet_lines:
                line = line.strip()
                if line and (line.startswith('•') or line.startswith('-') or line.startswith('*')):
                    # Clean the bullet point
                    clean_bullet = re.sub(r'^[•\-\*]\s*', '', line)
                    if clean_bullet:
                        bullets.append(clean_bullet)
        else:
            # Fallback parsing
            enhanced = result
            bullets = ["Could not parse bullet points. Please try again."]
        
        return {
            'success': True,
            'enhanced': enhanced,
            'bullets': bullets,
            'tone': tone,
            'original_length': len(text),
            'enhanced_length': len(enhanced)
        }
        
    except Exception as e:
        return {
            'error': f'AI processing error: {str(e)}',
            'success': False
        }


def generate_full_resume(data: dict) -> dict:
    """
    Generate a complete resume from user data
    
    Args:
        data: Dictionary containing user information
    
    Returns:
        Dictionary with formatted resume sections
    """
    
    name = data.get('name', 'Your Name')
    email = data.get('email', '')
    phone = data.get('phone', '')
    linkedin = data.get('linkedin', '')
    summary = data.get('summary', '')
    experience = data.get('experience', '')
    education = data.get('education', '')
    skills = data.get('skills', '')
    tone = data.get('tone', 'professional')
    
    prompt = f"""
        Create a professional resume with the following information.
        Use a {tone} tone throughout.
        
        Name: {name}
        Email: {email}
        Phone: {phone}
        LinkedIn: {linkedin}
        
        Summary/About: {summary}
        
        Experience: {experience}
        
        Education: {education}
        
        Skills: {skills}
        
        Please create a polished resume with:
        1. A compelling professional summary (3-4 sentences)
        2. Experience section with strong bullet points
        3. Education section properly formatted
        4. Skills section organized by category if possible
        
        Format the response as:
        
        SUMMARY:
        [Professional summary]
        
        EXPERIENCE:
        [Experience with bullet points]
        
        EDUCATION:
        [Education details]
        
        SKILLS:
        [Skills organized]
        
        Do NOT fabricate any information. Only enhance what's provided.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert resume writer who creates ATS-friendly, impactful resumes. Never add false information."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        result = response.choices[0].message.content
        
        # Parse sections
        sections = {
            'name': name,
            'email': email,
            'phone': phone,
            'linkedin': linkedin,
            'summary': '',
            'experience': '',
            'education': '',
            'skills': ''
        }
        
        # Simple parsing
        current_section = None
        lines = result.split('\n')
        
        for line in lines:
            line_upper = line.upper().strip()
            if 'SUMMARY:' in line_upper:
                current_section = 'summary'
            elif 'EXPERIENCE:' in line_upper:
                current_section = 'experience'
            elif 'EDUCATION:' in line_upper:
                current_section = 'education'
            elif 'SKILLS:' in line_upper:
                current_section = 'skills'
            elif current_section:
                sections[current_section] += line + '\n'
        
        # Clean up sections
        for key in ['summary', 'experience', 'education', 'skills']:
            sections[key] = sections[key].strip()
        
        return {
            'success': True,
            'resume': sections
        }
        
    except Exception as e:
        return {
            'error': f'Resume generation error: {str(e)}',
            'success': False
        }


# ============ ROUTES ============

@app.route('/')
def index():
    """Render the main page"""
    return render_template('index.html')


@app.route('/enhance', methods=['POST'])
def enhance():
    """API endpoint to enhance text"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    text = data.get('text', '')
    tone = data.get('tone', 'professional')
    content_type = data.get('type', 'resume')
    
    result = enhance_text(text, tone, content_type)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result)


@app.route('/generate-resume', methods=['POST'])
def generate_resume():
    """API endpoint to generate full resume"""
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    result = generate_full_resume(data)
    
    if 'error' in result:
        return jsonify(result), 400
    
    return jsonify(result)


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Resume Enhancer',
        'version': '1.0.0'
    })


# ============ DEMO MODE (No API Key Required) ============

@app.route('/demo-enhance', methods=['POST'])
def demo_enhance():
    """Demo endpoint that works without API key"""
    data = request.get_json()
    
    text = data.get('text', '')
    tone = data.get('tone', 'professional')
    
    # Simulated enhancement for demo
    demo_responses = {
        'professional': {
            'enhanced': f"Dedicated professional with demonstrated expertise in key areas. Proven track record of delivering results and driving innovation. Committed to continuous learning and excellence in all endeavors.",
            'bullets': [
                "Demonstrated strong technical proficiency and problem-solving capabilities",
                "Proven ability to deliver high-quality results in fast-paced environments",
                "Excellent communication and collaboration skills across diverse teams",
                "Committed to continuous professional development and learning",
                "Track record of innovative thinking and creative solutions"
            ]
        },
        'casual': {
            'enhanced': f"Hey there! I'm someone who's genuinely passionate about what I do. I love tackling challenges and creating things that make a real difference. Always eager to learn and grow!",
            'bullets': [
                "Passionate about creating meaningful solutions",
                "Love collaborating with awesome teams",
                "Always curious and eager to learn new things",
                "Enjoy turning complex problems into simple solutions",
                "Bring positive energy and creativity to every project"
            ]
        },
        'ats-friendly': {
            'enhanced': f"Results-driven professional with experience in software development, project management, and team collaboration. Skilled in multiple programming languages and development methodologies. Strong analytical and problem-solving abilities.",
            'bullets': [
                "Proficient in software development and programming",
                "Experience with agile methodologies and project management",
                "Strong analytical and problem-solving skills",
                "Excellent written and verbal communication abilities",
                "Team collaboration and cross-functional coordination"
            ]
        }
    }
    
    response = demo_responses.get(tone, demo_responses['professional'])
    
    return jsonify({
        'success': True,
        'enhanced': response['enhanced'],
        'bullets': response['bullets'],
        'tone': tone,
        'demo': True
    })


if __name__ == '__main__':
    # Check for API key
    if not os.getenv('OPENAI_API_KEY'):
        print("\n⚠️  WARNING: OPENAI_API_KEY not found!")
        print("📝 Demo mode available at /demo-enhance")
        print("🔑 Add your API key to .env file for full functionality\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
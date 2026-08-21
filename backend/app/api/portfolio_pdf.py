from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.database import get_db
import logging
from xhtml2pdf import pisa
import io

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/pdf")
async def generate_portfolio_pdf(db: AsyncSession = Depends(get_db)):
    # Fetch live projects from DB
    try:
        result = await db.execute(text("SELECT title, tagline, tech_stack, links FROM projects WHERE status = 'published' ORDER BY sort_order ASC"))
        projects = result.fetchall()
    except Exception as e:
        logger.error("Failed to fetch projects for PDF: %s", e)
        projects = []

    # Construct HTML
    html_content = """
    <html>
    <head>
    <style>
        @page { size: letter; margin: 1in; }
        body { font-family: Helvetica, sans-serif; font-size: 12pt; color: #333; }
        h1 { color: #B8552F; font-size: 24pt; margin-bottom: 0pt; }
        h2 { color: #161614; font-size: 14pt; border-bottom: 1px solid #ccc; margin-top: 20pt; }
        h3 { color: #161614; font-size: 12pt; margin-bottom: 0pt; }
        p { margin-top: 4pt; }
        .tagline { color: #555; font-style: italic; }
        .tech { font-family: monospace; font-size: 10pt; color: #B8552F; }
    </style>
    </head>
    <body>
        <h1>Mark Manoti Ndege</h1>
        <p class="tagline">Computer Science Diploma Student | Full-Stack Builder | AI & Cybersecurity Enthusiast</p>
        <p>Nairobi, Kenya | aetsh69.com@gmail.com | +254 722 138632 | github.com/N3stah</p>
        
        <h2>Profile Summary</h2>
        <p>Final-year Diploma in Computer Science student at The Nairobi National Polytechnic with a strong foundation in core computing principles. Experienced in full-stack web applications, AI-powered tools (RAG, ML), containerized multi-service systems, and CLI utilities. Seeking industrial attachment or internship opportunities.</p>

        <h2>Technical Skills</h2>
        <p>
            <b>Languages:</b> Python, TypeScript, Java, SQL, Bash<br/>
            <b>Backend:</b> FastAPI, Node.js, PostgreSQL, Redis, Docker<br/>
            <b>Frontend:</b> React, Vite, Tailwind CSS<br/>
            <b>AI/ML:</b> Scikit-Learn, pgvector, OpenAI/Claude APIs<br/>
            <b>Networking:</b> Cisco Packet Tracer, LAN Cabling, WPA3, USSD
        </p>

        <h2>Engineering Projects</h2>
    """

    for p in projects:
        tech = ", ".join(p.tech_stack) if p.tech_stack else "Various"
        html_content += f"<h3>{p.title}</h3>"
        html_content += f"<p class='tagline'>{p.tagline or ''}</p>"
        html_content += f"<p class='tech'>{tech}</p>"

    html_content += "</body></html>"

    # Generate PDF
    pdf_buffer = io.BytesIO()
    pisa_status = pisa.CreatePDF(io.StringIO(html_content), dest=pdf_buffer)
    
    if pisa_status.err:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=AETSH-69_Mark_Manoti_Ndege_CV.pdf"}
    )

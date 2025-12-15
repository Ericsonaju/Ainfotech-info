/**
 * AINFOTECH E-COMMERCE - Serviço de Geração de Anúncios com IA
 * Pipeline completo para geração de anúncios otimizados
 * 
 * @author AINFOTECH
 * @location Aracaju - Sergipe - Brasil
 */

import { geminiService } from '../../services/geminiService';
import { supabase } from '../../services/supabase';
import {
  Product,
  ProductType,
  OwnProduct,
  AffiliateProduct,
  AdPromptInput,
  GeneratedAd,
  ApiResponse
} from '../types';
import { COMPANY_INFO } from '../../constants';

// ============================================
// TEMPLATES DE PROMPT
// ============================================

const PROMPT_TEMPLATES = {
  professional: {
    tone: 'profissional e técnico',
    style: 'informativo, focado em especificações e benefícios técnicos'
  },
  casual: {
    tone: 'amigável e acessível',
    style: 'conversacional, focado em resolver problemas do dia a dia'
  },
  urgent: {
    tone: 'urgente e persuasivo',
    style: 'focado em escassez, promoções e call-to-action forte'
  },
  luxury: {
    tone: 'sofisticado e exclusivo',
    style: 'focado em qualidade premium e diferenciação'
  }
};

const PLATFORM_SPECS = {
  instagram: {
    maxLength: 2200,
    hashtagCount: 15,
    format: 'post com quebras de linha e emojis'
  },
  facebook: {
    maxLength: 5000,
    hashtagCount: 5,
    format: 'texto descritivo com CTA claro'
  },
  google: {
    maxLength: 90,
    hashtagCount: 0,
    format: 'título curto e descrição concisa para Google Ads'
  },
  whatsapp: {
    maxLength: 1000,
    hashtagCount: 0,
    format: 'mensagem direta e pessoal com link'
  },
  general: {
    maxLength: 500,
    hashtagCount: 5,
    format: 'texto versátil para múltiplas plataformas'
  }
};

// ============================================
// DISCLAIMERS LEGAIS
// ============================================

const LEGAL_DISCLAIMERS = {
  own: `📍 ${COMPANY_INFO.fantasyName} | Aracaju-SE | Garantia conforme CDC.`,
  
  affiliate: `📢 DIVULGAÇÃO: Este produto é vendido pelo Mercado Livre. Link de afiliado. ${COMPANY_INFO.fantasyName} não é o vendedor.`,
  
  price: `💰 Preços e disponibilidade sujeitos a alteração sem aviso prévio.`,
  
  warranty: `✅ Garantia legal de 90 dias (CDC Art. 26).`
};

// ============================================
// GERAÇÃO DE PROMPTS
// ============================================

/**
 * Gera prompt base para a IA
 */
function generateBasePrompt(input: AdPromptInput): string {
  const { product, targetAudience, tone = 'professional', platform = 'general' } = input;
  const toneConfig = PROMPT_TEMPLATES[tone];
  const platformConfig = PLATFORM_SPECS[platform];
  
  const isOwn = product.type === ProductType.OWN;
  const ownProduct = product as OwnProduct;
  const affiliateProduct = product as AffiliateProduct;
  
  const productInfo = `
INFORMAÇÕES DO PRODUTO:
- Nome: ${product.name}
- Categoria: ${product.category}
- Descrição: ${product.description}
${product.technicalSpecs ? `- Especificações Técnicas: ${product.technicalSpecs}` : ''}
${isOwn ? `- Preço: R$ ${ownProduct.finalPrice.toFixed(2)}` : `- Preço de Referência: R$ ${affiliateProduct.referencePrice.toFixed(2)}`}
${isOwn ? `- Garantia: ${ownProduct.warrantyDays} dias` : ''}
${!isOwn && affiliateProduct.freeShipping ? '- Frete Grátis!' : ''}
${!isOwn && affiliateProduct.rating ? `- Avaliação: ${affiliateProduct.rating} estrelas` : ''}
`.trim();

  const constraints = `
RESTRIÇÕES:
- Máximo de ${platformConfig.maxLength} caracteres
- ${platformConfig.hashtagCount > 0 ? `Incluir ${platformConfig.hashtagCount} hashtags relevantes` : 'Não usar hashtags'}
- Formato: ${platformConfig.format}
- Tom: ${toneConfig.tone}
- Estilo: ${toneConfig.style}
${isOwn ? '- IMPORTANTE: Este é um produto próprio da loja' : '- IMPORTANTE: Este é um produto de AFILIADO - não somos o vendedor, apenas divulgamos'}
`.trim();

  const legalInfo = `
CONFORMIDADE LEGAL:
- Empresa localizada em Aracaju-SE
- Seguir CDC (Código de Defesa do Consumidor)
- Não fazer promessas falsas
- ${isOwn ? 'Mencionar garantia legal' : 'Deixar claro que é link de afiliado'}
`.trim();

  return `
Você é um especialista em copywriting para e-commerce de tecnologia no Brasil.

${productInfo}

${constraints}

${targetAudience ? `PÚBLICO-ALVO: ${targetAudience}` : ''}

${legalInfo}

TAREFA:
Crie um anúncio atraente e convincente para este produto, seguindo todas as restrições e conformidade legal.

FORMATO DE RESPOSTA (JSON):
{
  "headline": "Título chamativo do anúncio",
  "body": "Corpo do anúncio com formatação adequada",
  "callToAction": "Frase de call-to-action",
  "hashtags": ["hashtag1", "hashtag2"],
  "seoKeywords": ["palavra-chave1", "palavra-chave2"],
  "legalDisclaimer": "Aviso legal apropriado"
}
`.trim();
}

/**
 * Enriquece o prompt com contexto adicional
 */
function enrichPrompt(basePrompt: string, product: Product): string {
  // Adiciona contexto de mercado local
  const localContext = `
CONTEXTO LOCAL:
- Região: Nordeste do Brasil
- Cidade: Aracaju, capital de Sergipe
- Considere termos e expressões regionais quando apropriado
- Preços em Real brasileiro (R$)
`;

  // Adiciona contexto de SEO
  const seoContext = `
OTIMIZAÇÃO SEO:
- Inclua variações da palavra-chave principal
- Use termos de busca populares para ${product.category}
- Considere sinônimos e termos relacionados
`;

  return `${basePrompt}\n\n${localContext}\n${seoContext}`;
}

/**
 * Revisa o anúncio gerado para conformidade legal
 */
function legalReview(ad: GeneratedAd, product: Product): GeneratedAd {
  const isOwn = product.type === ProductType.OWN;
  
  // Garante disclaimer adequado
  if (!ad.legalDisclaimer) {
    ad.legalDisclaimer = isOwn 
      ? LEGAL_DISCLAIMERS.own 
      : LEGAL_DISCLAIMERS.affiliate;
  }
  
  // Se for afiliado, garante aviso
  if (!isOwn && !ad.body.toLowerCase().includes('afiliado')) {
    ad.legalDisclaimer = LEGAL_DISCLAIMERS.affiliate + '\n' + ad.legalDisclaimer;
  }
  
  // Remove promessas proibidas
  const prohibitedTerms = [
    'garantido',
    'sem risco',
    'melhor do mundo',
    '100% garantido',
    'cura',
    'milagre'
  ];
  
  let cleanBody = ad.body;
  prohibitedTerms.forEach(term => {
    const regex = new RegExp(term, 'gi');
    cleanBody = cleanBody.replace(regex, '');
  });
  ad.body = cleanBody;
  
  return ad;
}

/**
 * Otimiza para SEO
 */
function optimizeSEO(ad: GeneratedAd, product: Product): GeneratedAd {
  // Garante palavras-chave mínimas
  if (!ad.seoKeywords || ad.seoKeywords.length < 3) {
    const defaultKeywords = [
      product.name.split(' ')[0].toLowerCase(),
      product.category,
      'comprar',
      'aracaju',
      'sergipe',
      'informática'
    ];
    ad.seoKeywords = [...new Set([...(ad.seoKeywords || []), ...defaultKeywords])].slice(0, 10);
  }
  
  // Garante hashtags para plataformas sociais
  if (!ad.hashtags || ad.hashtags.length === 0) {
    ad.hashtags = ad.seoKeywords.map(kw => kw.replace(/\s+/g, ''));
  }
  
  return ad;
}

/**
 * Padroniza o anúncio final
 */
function standardize(ad: GeneratedAd): GeneratedAd {
  // Remove espaços extras
  ad.headline = ad.headline.trim();
  ad.body = ad.body.trim();
  ad.callToAction = ad.callToAction.trim();
  
  // Garante que hashtags começam com #
  ad.hashtags = ad.hashtags.map(h => h.startsWith('#') ? h : `#${h}`);
  
  // Remove duplicatas
  ad.hashtags = [...new Set(ad.hashtags)];
  ad.seoKeywords = [...new Set(ad.seoKeywords)];
  
  return ad;
}

// ============================================
// FUNÇÃO PRINCIPAL: PIPELINE DE GERAÇÃO
// ============================================

/**
 * Gera anúncio usando pipeline completo
 * 
 * Pipeline:
 * 1. Entrada: dados do produto
 * 2. Geração de prompt base
 * 3. Enriquecimento automático
 * 4. Chamada à IA
 * 5. Revisão legal
 * 6. Otimização SEO
 * 7. Padronização final
 */
export async function generateAd(input: AdPromptInput): Promise<ApiResponse<GeneratedAd>> {
  try {
    // 1. Validação de entrada
    if (!input.product) {
      return { success: false, error: 'Produto não informado.' };
    }
    
    // 2. Gera prompt base
    const basePrompt = generateBasePrompt(input);
    
    // 3. Enriquece prompt
    const enrichedPrompt = enrichPrompt(basePrompt, input.product);
    
    // 4. Chama IA (usando Gemini existente)
    let generatedContent: any;
    
    try {
      // Usa o geminiService existente
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // @ts-ignore
          'x-goog-api-key': import.meta?.env?.VITE_GEMINI_API_KEY || ''
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: enrichedPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
            responseMimeType: 'application/json'
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!textContent) {
        throw new Error('Resposta vazia da IA');
      }
      
      generatedContent = JSON.parse(textContent);
      
    } catch (aiError: any) {
      console.error('[AdGenerator] Erro na IA:', aiError);
      
      // Fallback: gera anúncio básico
      generatedContent = generateFallbackAd(input);
    }
    
    // 5. Monta objeto do anúncio
    let ad: GeneratedAd = {
      id: `ad-${Date.now()}`,
      productId: input.product.id,
      headline: generatedContent.headline || input.product.name,
      body: generatedContent.body || input.product.description,
      callToAction: generatedContent.callToAction || 'Saiba mais!',
      hashtags: generatedContent.hashtags || [],
      seoKeywords: generatedContent.seoKeywords || [],
      legalDisclaimer: generatedContent.legalDisclaimer || '',
      platform: input.platform || 'general',
      createdAt: Date.now(),
      aiModel: 'gemini-2.0-flash'
    };
    
    // 6. Revisão legal
    ad = legalReview(ad, input.product);
    
    // 7. Otimização SEO
    ad = optimizeSEO(ad, input.product);
    
    // 8. Padronização
    ad = standardize(ad);
    
    // 9. Salva no banco (opcional)
    try {
      await supabase.from('generated_ads').insert([{
        product_id: input.product.id,
        product_type: input.product.type,
        headline: ad.headline,
        body: ad.body,
        call_to_action: ad.callToAction,
        hashtags: ad.hashtags,
        seo_keywords: ad.seoKeywords,
        legal_disclaimer: ad.legalDisclaimer,
        platform: ad.platform,
        ai_model: ad.aiModel
      }]);
    } catch (dbError) {
      console.warn('[AdGenerator] Erro ao salvar anúncio:', dbError);
    }
    
    return {
      success: true,
      data: ad,
      message: 'Anúncio gerado com sucesso!'
    };
    
  } catch (error: any) {
    console.error('[AdGenerator] Erro no pipeline:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Gera anúncio básico como fallback
 */
function generateFallbackAd(input: AdPromptInput): Partial<GeneratedAd> {
  const { product, platform = 'general' } = input;
  const isOwn = product.type === ProductType.OWN;
  const ownProduct = product as OwnProduct;
  const affiliateProduct = product as AffiliateProduct;
  
  const price = isOwn ? ownProduct.finalPrice : affiliateProduct.referencePrice;
  
  const emoji = {
    notebooks: '💻',
    smartphones: '📱',
    acessorios: '🎧',
    armazenamento: '💾',
    outros: '🛒'
  }[product.category] || '🛒';
  
  return {
    headline: `${emoji} ${product.name}`,
    body: `${product.description}\n\n💰 R$ ${price.toFixed(2)}${isOwn ? `\n✅ Garantia de ${ownProduct.warrantyDays} dias` : affiliateProduct.freeShipping ? '\n🚚 Frete Grátis!' : ''}\n\n📍 ${COMPANY_INFO.fantasyName} - Aracaju/SE`,
    callToAction: isOwn ? 'Compre agora!' : 'Ver no Mercado Livre →',
    hashtags: [product.category, 'informatica', 'tecnologia', 'aracaju', 'sergipe'],
    seoKeywords: [product.name.toLowerCase(), product.category, 'comprar'],
    legalDisclaimer: isOwn ? LEGAL_DISCLAIMERS.own : LEGAL_DISCLAIMERS.affiliate
  };
}

/**
 * Gera múltiplos anúncios para diferentes plataformas
 */
export async function generateMultiPlatformAds(
  product: Product,
  platforms: Array<'instagram' | 'facebook' | 'google' | 'whatsapp'> = ['instagram', 'facebook', 'whatsapp']
): Promise<ApiResponse<GeneratedAd[]>> {
  try {
    const ads: GeneratedAd[] = [];
    
    for (const platform of platforms) {
      const result = await generateAd({
        product,
        platform,
        tone: platform === 'google' ? 'professional' : 'casual'
      });
      
      if (result.success && result.data) {
        ads.push(result.data);
      }
    }
    
    if (ads.length === 0) {
      return { success: false, error: 'Não foi possível gerar anúncios.' };
    }
    
    return {
      success: true,
      data: ads,
      message: `${ads.length} anúncios gerados com sucesso!`
    };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Busca histórico de anúncios do produto
 */
export async function fetchProductAds(productId: string): Promise<GeneratedAd[]> {
  const { data, error } = await supabase
    .from('generated_ads')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) return [];
  
  return (data || []).map(a => ({
    id: a.id,
    productId: a.product_id,
    headline: a.headline,
    body: a.body,
    callToAction: a.call_to_action,
    hashtags: a.hashtags || [],
    seoKeywords: a.seo_keywords || [],
    legalDisclaimer: a.legal_disclaimer,
    platform: a.platform,
    createdAt: new Date(a.created_at).getTime(),
    aiModel: a.ai_model
  }));
}

// ============================================
// EXPORT
// ============================================

export const adGeneratorService = {
  generateAd,
  generateMultiPlatformAds,
  fetchProductAds,
  LEGAL_DISCLAIMERS,
  PROMPT_TEMPLATES,
  PLATFORM_SPECS
};

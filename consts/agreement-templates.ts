import { AgreementFormValues } from "@/components/Dashboard/Agreements/AgreementForm";


export const VENDOR_AGREEMENT_TEMPLATE: AgreementFormValues = {
    agreementType: "INITIAL_VENDOR_AGREEMENT",
    documentTitle: "Contrato de Comerciante",
    parts: [
        {
            "clauses": [
                {
                    "clauseNumber": 1,
                    "clauseTitle": "Objeto do Contrato",
                    "bodyHtml": "<p>O presente Contrato de Comerciante estabelece os termos e condições\n          que regem a participação do Comerciante na Plataforma DeliGo. A\n          DeliGo explora um mercado digital que liga Clientes, Comerciantes e\n          Estafetas Independentes, atuando exclusivamente como intermediário\n          tecnológico e facilitador do mercado.</p>\n\n        <div class=\"subheading\">A DeliGo NÃO:</div>\n        <ul class=\"bullet-list\">\n          <li>Fabrica produtos;</li>\n          <li>Prepara alimentos;</li>\n          <li>Vende produtos diretamente;</li>\n          <li>Emprega estafetas de entrega;</li>\n          <li>Presta serviços de transporte.</li>\n        </ul>\n\n        <p>O contrato de venda existe exclusivamente entre o Comerciante e o\n          Cliente. O contrato de entrega existe exclusivamente entre o Cliente\n          e o Estafeta. A DeliGo não é parte em nenhum destes contratos.</p>",
                    "forcePageBreakBefore": true
                },
                {
                    "clauseNumber": 2,
                    "clauseTitle": "Vigência do Contrato",
                    "bodyHtml": "<p>O presente Contrato produz efeitos na data da assinatura ou no\n          momento da aceitação eletrónica através da Plataforma DeliGo,\n          mantendo-se em vigor até à sua cessação nos termos da Cláusula 18.</p>"
                },
                {
                    "clauseNumber": 3,
                    "clauseTitle": "Requisitos de Elegibilidade do Vendedor",
                    "bodyHtml": "<p>O Comerciante declara e garante que cumpre os seguintes\n          requisitos:</p>\n\n        <div class=\"subheading\">Registo Comercial</div>\n        <ul class=\"bullet-list\">\n          <li>Está legalmente constituído em Portugal ou noutra jurisdição\n            permitida;</li>\n          <li>Possui um NIF ou NIPC válido;</li>\n          <li>Detém todos os registos e licenças exigidos.</li>\n        </ul>\n\n        <div class=\"subheading\">Requisitos de Licenciamento (quando\n          aplicável)</div>\n        <ul class=\"bullet-list\">\n          <li>Licenças de manuseamento de alimentos;</li>\n          <li>Autorizações da ASAE;</li>\n          <li>Licenças municipais;</li>\n          <li>Certificados de saúde e segurança;</li>\n          <li>Conformidade com o sistema HACCP;</li>\n          <li>Quaisquer licenças exigidas pela legislação portuguesa e da\n            UE.</li>\n        </ul>\n\n        <div class=\"subheading\">Requisitos Bancários</div>\n        <ul class=\"bullet-list\">\n          <li>Uma conta com IBAN válido;</li>\n          <li>Informação de pagamento exata.</li>\n        </ul>\n\n        <div class=\"subheading\">Registo Fiscal</div>\n        <ul class=\"bullet-list\">\n          <li>Registar-se para efeitos de IVA quando aplicável;</li>\n          <li>Manter todos os registos fiscais;</li>\n          <li>Apresentar todas as declarações exigidas por lei.</li>\n        </ul>"
                },
                {
                    "clauseNumber": 4,
                    "clauseTitle": "Registo e Verificação",
                    "bodyHtml": "<p>O Comerciante compromete-se a fornecer informação exata e completa,\n          incluindo nome da empresa, morada da sede, NIF/NIPC, dados de\n          contacto, IBAN, licenças e certificações, e dados do representante\n          autorizado.</p>\n\n        <div class=\"subheading\">A DeliGo pode:</div>\n        <ul class=\"bullet-list\">\n          <li>Verificar a informação;</li>\n          <li>Solicitar documentação adicional;</li>\n          <li>Realizar verificações de conformidade;</li>\n          <li>Aprovar ou recusar candidaturas;</li>\n          <li>Suspender o registo enquanto aguarda verificação.</li>\n        </ul>\n\n        <p>O Comerciante deve notificar imediatamente a DeliGo de quaisquer\n          alterações à titularidade, licenças, estatuto jurídico, dados\n          bancários ou informação fiscal.</p>"
                },
                {
                    "clauseNumber": 5,
                    "clauseTitle": "Condições Comerciais",
                    "bodyHtml": "<div class=\"subheading\">Comissão de Serviço da Plataforma</div>\n        <p>A DeliGo cobra uma comissão de <strong>15% sobre o valor total da\n            encomenda</strong>, acrescida de IVA à taxa legal aplicável. A\n          comissão é automaticamente deduzida antes do pagamento e abrange o\n          acesso à plataforma, o processamento de pagamentos, o apoio ao\n          cliente, a infraestrutura tecnológica, as iniciativas de marketing e\n          os serviços de coordenação de estafetas.</p>\n\n        <p><strong>Exemplo de cálculo:</strong></p>\n        <table class=\"calc-table\">\n          <tr>\n            <th>Descrição</th>\n            <th>Valor</th>\n          </tr>\n          <tr>\n            <td>Valor da Encomenda (sem IVA incluído)</td>\n            <td>€20,00</td>\n          </tr>\n          <tr>\n            <td>Comissão da Plataforma (15%)</td>\n            <td>€3,00</td>\n          </tr>\n          <tr>\n            <td>IVA (23%)</td>\n            <td>€0,69</td>\n          </tr>\n          <tr>\n            <td>Total da Dedução</td>\n            <td>€3,69</td>\n          </tr>\n          <tr class=\"total-row\">\n            <td>Comerciante Recebe</td>\n            <td>€16,31</td>\n          </tr>\n        </table>"
                },
                {
                    "clauseNumber": 6,
                    "clauseTitle": "Taxa de Ativação",
                    "bodyHtml": "<p>A integração e a ativação da conta do Vendedor são\n          <strong>gratuitas (€0)</strong>.</p>"
                },
                {
                    "clauseNumber": 7,
                    "clauseTitle": "Dispositivo POS (Tablet)",
                    "bodyHtml": "<p>A DeliGo pode fornecer um tablet POS dedicado para a gestão de\n          encomendas.</p>\n        <p><strong>Custo do dispositivo:</strong> €150,00, com IVA já\n          incluído</p>\n        <p><strong>Condições de pagamento</strong></p>\n\n        \n\n        <div class=\"subheading\">O Comerciante deve:</div>\n        <ul class=\"bullet-list\">\n          <li>Conservar o dispositivo;</li>\n          <li>Protegê-lo contra perda ou dano;</li>\n          <li>Devolvê-lo se tal for solicitado;</li>\n          <li>Pagar por danos que excedam o desgaste normal de utilização.</li>\n        </ul>\n\n        <p>A propriedade e a utilização regem-se pelo presente Contrato e por\n          qualquer Acordo de Dispositivo POS autónomo.</p>",
                    "showPosPaymentWidget": true
                },
                {
                    "clauseNumber": 8,
                    "clauseTitle": "Pagamentos",
                    "bodyHtml": "<div class=\"subheading\">Periodicidade</div>\n        <p>Os pagamentos são processados <strong>duas vezes por semana — às\n            segundas-feiras e às sextas-feiras</strong> — por transferência\n          bancária para o IBAN registado do Comerciante. O processamento\n          bancário pode demorar um a dois dias úteis.</p>\n\n        <div class=\"subheading\">Cálculo</div>\n        <p>O valor a pagar ao Comerciante corresponde à Receita Bruta das\n          Encomendas, deduzida das comissões da plataforma, do IVA, das\n          deduções do POS, dos reembolsos, dos estornos e de outras deduções\n          acordadas.</p>\n\n        <div class=\"subheading\">Atrasos no Pagamento</div>\n        <p>A DeliGo pode atrasar ou reter pagamentos quando necessário,\n          designadamente em casos de suspeita de fraude, investigações\n          regulatórias, litígios de estorno, falta de informação DAC7 ou\n          incumprimento do presente Contrato. O Comerciante será, em regra,\n          notificado no prazo de cinco dias úteis.</p>"
                },
                {
                    "clauseNumber": 9,
                    "clauseTitle": "Comunicação Fiscal DAC7",
                    "bodyHtml": "<p>A DeliGo está sujeita à Diretiva (UE) 2021/514 do Conselho (DAC7).\n          O Comerciante reconhece que a DeliGo pode recolher, verificar,\n          tratar e comunicar informação à Autoridade Tributária e Aduaneira,\n          incluindo nome da empresa, morada, NIF/NIPC, residência fiscal,\n          IBAN, receita bruta, comissões da plataforma e impostos. A\n          comunicação DAC7 não substitui as obrigações fiscais autónomas do\n          Comerciante.</p>",
                    "forcePageBreakBefore": true
                },
                {
                    "clauseNumber": 10,
                    "clauseTitle": "Normas de Listagem de Produtos",
                    "bodyHtml": "<p>O Comerciante garante que todas as listagens são exatas; incluem\n          ingredientes, alergénios e preços; cumprem o Regulamento (UE)\n          1169/2011; e são lícitas.</p>\n\n        <div class=\"subheading\">O Comerciante não pode vender:</div>\n        <ul class=\"bullet-list\">\n          <li>Bens ilegais;</li>\n          <li>Bens contrafeitos;</li>\n          <li>Produtos proibidos;</li>\n          <li>Produtos restritos.</li>\n        </ul>\n\n        <p>A DeliGo pode remover listagens sem aviso prévio.</p>"
                },
                {
                    "clauseNumber": 11,
                    "clauseTitle": "Aceitação e Cumprimento de Encomendas",
                    "bodyHtml": "<div class=\"subheading\">O Comerciante compromete-se a:</div>\n        <ul class=\"bullet-list\">\n          <li>Aceitar ou recusar encomendas com prontidão;</li>\n          <li>Preparar os produtos com rigor;</li>\n          <li>Embalar os produtos em segurança;</li>\n          <li>Informar imediatamente a DeliGo caso não consiga cumprir uma\n            encomenda.</li>\n        </ul>\n\n        <p>Atrasos ou cancelamentos persistentes podem resultar em\n          visibilidade reduzida, suspensão ou cessação.</p>"
                },
                {
                    "clauseNumber": 12,
                    "clauseTitle": "Segurança Alimentar e Responsabilidade por Alergénios",
                    "bodyHtml": "<p>O Comerciante é o único responsável pela segurança alimentar,\n          higiene, preparação dos produtos, rotulagem e declarações de\n          alergénios, devendo cumprir o Regulamento (CE) n.º 852/2004, o\n          Regulamento (UE) n.º 1169/2011, os requisitos da ASAE, os\n          princípios HACCP e a legislação portuguesa de segurança alimentar.</p>\n\n        <div class=\"subheading\">O Comerciante indemnizará a DeliGo por\n          reclamações decorrentes de:</div>\n        <ul class=\"bullet-list\">\n          <li>Intoxicação alimentar;</li>\n          <li>Contaminação;</li>\n          <li>Rotulagem incorreta de alergénios;</li>\n          <li>Sanções regulatórias;</li>\n          <li>Danos pessoais.</li>\n        </ul>"
                },
                {
                    "clauseNumber": 13,
                    "clauseTitle": "Proteção de Dados e RGPD",
                    "bodyHtml": "<p>Ambas as partes devem cumprir o Regulamento (UE) 2016/679 (RGPD), a\n          Lei n.º 58/2019 e a legislação portuguesa de proteção de dados.</p>\n\n        <div class=\"subheading\">O Comerciante compromete-se a:</div>\n        <ul class=\"bullet-list\">\n          <li>Tratar os dados dos clientes exclusivamente para o cumprimento\n            das encomendas;</li>\n          <li>Não vender, divulgar ou reutilizar os dados dos clientes;</li>\n          <li>Implementar medidas de segurança adequadas;</li>\n          <li>Notificar a DeliGo de violações de dados no prazo de vinte e\n            quatro (24) horas.</li>\n        </ul>\n\n        <p>O Comerciante indemnizará a DeliGo por prejuízos decorrentes de\n          violações do RGPD.</p>"
                },
                {
                    "clauseNumber": 14,
                    "clauseTitle": "Requisitos de Seguro",
                    "bodyHtml": "<p>O Comerciante deve manter, quando legalmente exigido, seguro de\n          responsabilidade civil, seguro de responsabilidade do produto,\n          seguro de responsabilidade da entidade empregadora e qualquer\n          seguro obrigatório exigido pela lei portuguesa. A DeliGo pode\n          solicitar comprovativo de seguro a qualquer momento.</p>"
                },
                {
                    "clauseNumber": 15,
                    "clauseTitle": "Propriedade Intelectual",
                    "bodyHtml": "<p>O Comerciante concede à DeliGo uma licença não exclusiva, isenta de\n          royalties e de âmbito mundial para utilizar os seus nomes\n          comerciais, logótipos, descrições de produtos, imagens, marcas e\n          materiais de identidade visual, exclusivamente para operações da\n          plataforma, publicidade e atividades de marketing. A propriedade\n          permanece com o Comerciante.</p>",
                    "forcePageBreakBefore": true
                },
                {
                    "clauseNumber": 16,
                    "clauseTitle": "Confidencialidade",
                    "bodyHtml": "<p>Ambas as partes devem manter confidenciais todas as informações\n          comerciais, informações de preços, relatórios, dados de clientes e\n          informações operacionais. A informação confidencial só pode ser\n          divulgada quando exigido por lei.</p>"
                },
                {
                    "clauseNumber": 17,
                    "clauseTitle": "Força Maior",
                    "bodyHtml": "<p>Nenhuma das partes será responsável por atrasos causados por\n          eventos fora do seu controlo razoável, incluindo catástrofes\n          naturais, inundações, sismos, pandemias, guerra, terrorismo,\n          restrições governamentais, falhas de serviços públicos,\n          interrupções de Internet e ciberataques. Se tal evento persistir\n          por mais de trinta (30) dias consecutivos, qualquer das partes pode\n          rescindir o presente Contrato.</p>"
                },
                {
                    "clauseNumber": 18,
                    "clauseTitle": "Suspensão e Cessação",
                    "bodyHtml": "<div class=\"subheading\">A DeliGo pode suspender a conta do Comerciante\n          por:</div>\n        <ul class=\"bullet-list\">\n          <li>Fraude;</li>\n          <li>Reclamações;</li>\n          <li>Falta de licenças;</li>\n          <li>Ação regulatória;</li>\n          <li>Incumprimento da DAC7;</li>\n          <li>Incumprimento do presente Contrato.</li>\n        </ul>\n\n        <div class=\"subheading\">A DeliGo pode rescindir:</div>\n        <ul class=\"bullet-list\">\n          <li>Imediatamente, em caso de fraude ou atividade criminosa;</li>\n          <li>Mediante aviso prévio escrito de quinze (15) dias, em caso de\n            incumprimento material.</li>\n        </ul>\n\n        <p>O Comerciante pode rescindir mediante aviso prévio escrito de\n          trinta (30) dias. Os pagamentos pendentes serão, em regra,\n          processados no prazo de trinta (30) dias após a cessação.</p>"
                },
                {
                    "clauseNumber": 19,
                    "clauseTitle": "Lei Aplicável e Foro Competente",
                    "bodyHtml": "<p>O presente Contrato rege-se pela lei portuguesa. Os tribunais de\n          Lisboa, Portugal, têm jurisdição exclusiva. Os mecanismos de\n          resolução de litígios de consumo disponíveis ao abrigo da lei\n          portuguesa e europeia mantêm-se inalterados.</p>"
                }
            ]
        }
    ],
};

export const FLEET_MANAGER_AGREEMENT_TEMPLATE: AgreementFormValues = {
    agreementType: "INITIAL_FLEET_MANAGER_AGREEMENT",
    documentTitle: "Acordo de Gestor de Frota",
    effectiveFrom: null,
    parts: [
        {
            "partTitle": "PARTE A — DISPOSIÇÕES GERAIS",
            "clauses": [
                {
                    "clauseNumber": 1,
                    "clauseTitle": "PARTES E ACEITAÇÃO",
                    "forcePageBreakBefore": true,
                    "bodyHtml": "<p>O presente Acordo de Gestor de Frota (\"Acordo\") é celebrado entre a PIXELMIRACLE LDA, com a denominação comercial DeliGo, NIF 518758176, com sede na Rua Joaquim Agostinho 16C, 1750-126 Lisboa, Portugal (\"DeliGo\", \"nós\"), e a empresa ou pessoa singular que se regista ou opera como gestor de frota, parceiro de estafetas ou titular de conta equivalente (\"Gestor de Frota\").</p><p>Ao registar-se, ao assinalar uma caixa de aceitação, ao assinar eletronicamente, ao aceder ao painel do Gestor de Frota, ao aceitar entregas através da Plataforma ou ao continuar a utilizar os serviços da DeliGo, o Gestor de Frota confirma que leu, compreendeu e aceita ficar vinculado ao presente Acordo e a todas as políticas nele referidas. Caso atue em nome de uma sociedade, o Gestor de Frota garante que dispõe de plenos poderes para a vincular.</p>"
                },
                {
                    "clauseNumber": 2,
                    "clauseTitle": "ESTATUTO DA PLATAFORMA E FUNÇÃO DE INTERMEDIÁRIO",
                    "bodyHtml": "<p>A DeliGo opera uma plataforma tecnológica de mercado (marketplace) que facilita a apresentação de partes, a gestão de encomendas e as transações digitais entre clientes, comerciantes, Gestores de Frota e estafetas independentes. A DeliGo não presta ao Gestor de Frota quaisquer serviços de estafeta, transporte, logística, emprego, cedência de mão de obra, processamento salarial ou gestão de estafetas.</p><p>A DeliGo atua como intermediário digital neutro e operador de mercado em linha. A DeliGo não é parte na relação contratual entre o Gestor de Frota e os seus estafetas, trabalhadores, subcontratados ou demais pessoal, e a DeliGo não controla o estatuto legal, fiscal, laboral, de seguros ou de segurança social dessas pessoas.</p>"
                },
                {
                    "clauseNumber": 3,
                    "clauseTitle": "DEFINIÇÕES",
                    "bodyHtml": "<ul class=\"bullet-list\"><li><strong>Plataforma:</strong> a aplicação DeliGo, o website, o painel de administração, o painel de frota, as APIs, as ferramentas de apoio e os serviços associados.</li><li><strong>Gestor de Frota:</strong> parceiro de estafetas independente, empresa, sociedade ou empresário em nome individual que recruta, verifica, regista, gere e paga estafetas.</li><li><strong>Estafeta:</strong> qualquer pessoa singular, estafeta, trabalhador, contratante, subcontratado ou prestador de serviços contratado pelo Gestor de Frota para efetuar entregas.</li><li><strong>Rendimento dos Estafetas:</strong> ganhos brutos de entrega gerados pelos estafetas através da Plataforma, antes da comissão do Gestor de Frota, impostos, deduções, reembolsos, estornos ou ajustamentos.</li><li><strong>Comissão do Gestor de Frota:</strong> 4% do Rendimento dos Estafetas, salvo acordo escrito em contrário.</li><li><strong>Lei Aplicável:</strong> todas as leis, regulamentos, orientações oficiais, regras fiscais, regras laborais, regras de proteção de dados, regras de trânsito, regras de plataformas e requisitos de proteção do consumidor portugueses e da UE aplicáveis aos serviços.</li></ul>"
                },
                {
                    "clauseNumber": 4,
                    "clauseTitle": "LEI APLICÁVEL E JURISDIÇÃO",
                    "bodyHtml": "<p>O presente Acordo rege-se pela lei portuguesa, sem prejuízo das normas imperativas do direito da UE. Sem prejuízo de qualquer foro de resolução de litígios imposto por lei imperativa, são competentes os tribunais de Lisboa, Portugal.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE B — CONDIÇÕES COMERCIAIS, PAGAMENTOS E FISCALIDADE",
            "clauses": [
                {
                    "clauseNumber": 5,
                    "clauseTitle": "CONDIÇÕES COMERCIAIS",
                    "bodyHtml": "<table class=\"calc-table\"><tr><th>Descrição</th><th>Valor</th></tr><tr><td>Comissão do Gestor de Frota</td><td>4% do Rendimento dos Estafetas gerado através da Plataforma</td></tr><tr><td>Registo de Estafetas</td><td>Responsabilidade exclusiva do Gestor de Frota</td></tr><tr><td>Pagamento aos Estafetas</td><td>O Gestor de Frota paga diretamente aos estafetas, salvo se for expressamente acordado outro mecanismo de pagamento lícito</td></tr><tr><td>Método de Pagamento</td><td>Transferência bancária para o IBAN registado e verificado</td></tr><tr><td>Moeda</td><td>EUR (€)</td></tr><tr><td>Taxa de Registo / Ativação</td><td>Gratuita (0 €)</td></tr></table>"
                },
                {
                    "clauseNumber": 6,
                    "clauseTitle": "COMISSÃO E EXEMPLO",
                    "bodyHtml": "<p>O Gestor de Frota aufere e retém uma comissão de 4% do Rendimento dos Estafetas gerado pelos seus estafetas através da Plataforma.</p><table class=\"calc-table\"><tr><th>Descrição</th><th>Valor</th></tr><tr><td>Rendimento dos Estafetas</td><td>1 000 €</td></tr><tr><td>Comissão do Gestor de Frota (4%)</td><td>40 €</td></tr></table><p>O montante remanescente é tratado de acordo com o mecanismo de pagamento aplicável e com os acordos do Gestor de Frota com os seus estafetas.</p>"
                },
                {
                    "clauseNumber": 7,
                    "clauseTitle": "PROCESSO DE PAGAMENTO E RETENÇÃO",
                    "bodyHtml": "<p>A DeliGo pode pagar os montantes devidos por transferência bancária para o IBAN verificado registado na conta do Gestor de Frota, de acordo com o calendário de pagamentos configurado durante a integração (onboarding) ou apresentado no painel. A DeliGo pode atrasar, compensar, suspender, congelar ou reter pagamentos sempre que tal seja exigido ou razoavelmente justificado por suspeita de fraude, estornos, reclamações de clientes, atrasos do processador de pagamentos, pedidos regulatórios, falta de informação KYC/AML, lacunas de reporte fiscal, falha de seguro, incumprimento do presente Acordo ou falta de prestação de dados DAC7 exatos. Sempre que legal e operacionalmente possível, a DeliGo notificará o Gestor de Frota no prazo de cinco dias úteis.</p>"
                },
                {
                    "clauseNumber": 8,
                    "clauseTitle": "DAC7 E REPORTE FISCAL",
                    "bodyHtml": "<p>A DeliGo pode estar obrigada a recolher, verificar, conservar e reportar informação sobre Gestores de Frota e pagamentos ao abrigo da Diretiva (UE) 2021/514 do Conselho (DAC7), das regras fiscais portuguesas e das regras de cooperação administrativa conexas. A informação pode incluir nome legal, denominação comercial, morada registada, número de identificação fiscal, número de IVA quando aplicável, residência fiscal, IBAN, rendimentos brutos, comissões, taxas e montantes de pagamento trimestrais ou anuais.</p><p>O reporte DAC7 pela DeliGo não substitui a obrigação do Gestor de Frota de declarar rendimentos, emitir faturas ou recibos quando exigido, manter registos contabilísticos, pagar impostos e cumprir as obrigações de IVA, IRC, IRS Categoria B, Segurança Social, retenção na fonte e demais obrigações de reporte.</p>"
                },
                {
                    "clauseNumber": 9,
                    "clauseTitle": "RESPONSABILIDADE FISCAL DO GESTOR DE FROTA",
                    "bodyHtml": "<p>O Gestor de Frota é o único responsável por todos os impostos, contribuições para a segurança social, obrigações salariais, faturas, retenções na fonte, declarações, registos contabilísticos e entregas relacionados com o seu negócio, estafetas, trabalhadores, contratantes, subcontratados e veículos. A DeliGo não presta aconselhamento fiscal e não retém nem entrega impostos por conta do Gestor de Frota, salvo quando a lei imperativa exija uma ação específica de reporte ou retenção.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE C — INTEGRAÇÃO, KYC, SEGUROS E ELEGIBILIDADE",
            "clauses": [
                {
                    "clauseNumber": 10,
                    "clauseTitle": "REQUISITOS DE ELEGIBILIDADE",
                    "bodyHtml": "<ul class=\"bullet-list\"><li>Estar legalmente registado em Portugal como sociedade, empresário em nome individual ou outra forma jurídica lícita, com NIF/NIPC ativo.</li><li>Deter todas as licenças, registos, autorizações e permissões necessárias para operar um negócio de estafetas, entregas ou frota.</li><li>Manter uma conta bancária portuguesa ou de outro modo aceite na UE, em nome do Gestor de Frota.</li><li>Manter cobertura de seguro adequada para o negócio, os veículos, os estafetas e a responsabilidade perante terceiros.</li><li>Ter capacidade jurídica para celebrar o presente Acordo e não estar sujeito a insolvência, sanções ou restrições legais que impeçam o seu cumprimento.</li></ul>"
                },
                {
                    "clauseNumber": 11,
                    "clauseTitle": "KYC, AML E BENEFICIÁRIO EFETIVO",
                    "bodyHtml": "<p>A DeliGo pode exigir verificação de identidade, documentos de registo da sociedade, dados do beneficiário efetivo, comprovativo de morada, certidões fiscais, comprovativo de IBAN, certificados de seguro, licenças, autorizações, prova de registo criminal ou de autorização para trabalhar, quando permitido por lei, e quaisquer outros documentos razoavelmente necessários para integração, antifraude, requisitos bancários, fiscalidade, AML, sanções ou conformidade.</p><p>A DeliGo pode recusar a integração, suspender o acesso, reter pagamentos ou cessar a conta caso o Gestor de Frota não conclua a verificação, preste informação falsa ou incompleta, não atualize a informação ou apresente um risco inaceitável de fraude, jurídico, de sanções, de AML, regulatório, fiscal, de segurança ou reputacional.</p>"
                },
                {
                    "clauseNumber": 12,
                    "clauseTitle": "SANÇÕES E PESSOAS RESTRITAS",
                    "bodyHtml": "<p>O Gestor de Frota declara que nem ele, nem os seus administradores, beneficiários efetivos, dirigentes, estafetas, subcontratados ou entidades controladas estão sujeitos a sanções da UE, ONU, Reino Unido, OFAC dos EUA ou outras sanções aplicáveis, restrições à exportação, congelamento de ativos ou proibições legais. O Gestor de Frota notificará imediatamente a DeliGo de qualquer alteração relacionada com sanções.</p>"
                },
                {
                    "clauseNumber": 13,
                    "clauseTitle": "REQUISITOS DE SEGURO",
                    "bodyHtml": "<p>O Gestor de Frota deve manter, a expensas próprias, cobertura de seguro adequada à sua atividade, incluindo, conforme aplicável: seguro de responsabilidade civil, seguro de responsabilidade do empregador ou de acidentes de trabalho, seguro automóvel, cobertura de mercadorias transportadas ou de responsabilidade de estafeta, cobertura de acidentes pessoais para estafetas quando legalmente exigida ou comercialmente adequada, e qualquer outra cobertura exigida pela lei portuguesa ou pela política da DeliGo. A prova da cobertura deve ser apresentada mediante solicitação.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE D — ESTAFETAS, ESTATUTO LABORAL E CONFORMIDADE OPERACIONAL",
            "clauses": [
                {
                    "clauseNumber": 14,
                    "clauseTitle": "RECRUTAMENTO, VERIFICAÇÃO E REGISTOS DOS ESTAFETAS",
                    "bodyHtml": "<p>O Gestor de Frota é o único responsável por recrutar, verificar, integrar, registar, formar, supervisionar quando legalmente adequado, e pagar os seus estafetas. O Gestor de Frota deve verificar a identidade de cada estafeta, a idade igual ou superior a 18 anos, o direito a trabalhar em Portugal, a autorização de residência ou de trabalho quando aplicável, a carta de condução ou autorização de veículo quando exigida, o estatuto fiscal, o registo na Segurança Social quando aplicável, a cobertura de seguro e a aptidão para efetuar entregas de forma lícita e segura.</p>"
                },
                {
                    "clauseNumber": 15,
                    "clauseTitle": "CONFORMIDADE COM TRABALHO INDEPENDENTE E LABORAL",
                    "bodyHtml": "<p>O Gestor de Frota e os seus estafetas não são trabalhadores, agentes, parceiros, franquiados ou representantes da DeliGo. O Gestor de Frota determina a sua própria organização empresarial e é responsável pela classificação jurídica de cada estafeta como trabalhador por conta de outrem, contratante, trabalhador independente, subcontratado ou outra categoria lícita.</p><p>A DeliGo não controla o horário de trabalho, as condições de emprego, o salário, os impostos, a segurança social, as férias, os benefícios, o processo disciplinar, a escolha de rotas, a propriedade dos veículos ou o equipamento dos estafetas. O Gestor de Frota deve assegurar que os seus regimes de estafetas cumprem o Código do Trabalho português, as regras de trabalho em plataformas digitais, as obrigações de Segurança Social, os requisitos de saúde e segurança e todas as regras contra o falso trabalho independente.</p>"
                },
                {
                    "clauseNumber": 16,
                    "clauseTitle": "INDEMNIZAÇÃO POR RECLASSIFICAÇÃO LABORAL",
                    "bodyHtml": "<p>Se qualquer tribunal, autoridade, regulador, trabalhador, estafeta, sindicato ou terceiro alegar ou determinar que um estafeta é ou foi trabalhador, colaborador, agente ou representante da DeliGo em virtude de atos, omissões, documentação, instruções, pagamentos ou gestão do Gestor de Frota, o Gestor de Frota indemnizará e isentará a DeliGo de quaisquer reclamações, impostos, contribuições para a Segurança Social, sanções, salários, benefícios, compensações, custos legais, coimas e responsabilidades, na máxima medida permitida por lei.</p>"
                },
                {
                    "clauseNumber": 17,
                    "clauseTitle": "DEVERES OPERACIONAIS DO GESTOR DE FROTA",
                    "bodyHtml": "<ul class=\"bullet-list\"><li>Pagar aos estafetas de forma correta, lícita e atempada.</li><li>Manter registos exatos de estafetas, veículos, fiscais, de seguros, bancários e de conformidade.</li><li>Assegurar que os estafetas utilizam veículos em condições de circulação, segurados e legalmente conformes.</li><li>Assegurar que os estafetas cumprem as regras de trânsito, de segurança, de manuseamento de alimentos, de apoio ao cliente e de conduta na Plataforma.</li><li>Tratar prontamente as reclamações de clientes, comerciantes, estafetas e reguladores relativas aos seus estafetas.</li><li>Notificar imediatamente a DeliGo de acidentes, incidentes graves, investigações regulatórias, caducidade de seguros, violações de dados, fraude ou problemas de licenciamento.</li></ul>"
                },
                {
                    "clauseNumber": 18,
                    "clauseTitle": "PADRÕES DE QUALIDADE E DESEMPENHO",
                    "bodyHtml": "<p>O acesso do Gestor de Frota à Plataforma pode ser monitorizado com base em indicadores de qualidade objetivos, incluindo conclusão de entregas, taxas de cancelamento, volume de reclamações, avaliações de clientes, sinais de fraude, incidentes de segurança, tempo de resposta, falhas de conformidade e feedback dos comerciantes. A DeliGo pode emitir avisos, solicitar correção, reduzir o acesso, suspender a conta ou cessar o Acordo em caso de falhas graves ou persistentes.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE E — PROTEÇÃO DE DADOS, CONFIDENCIALIDADE E PROVA DIGITAL",
            "clauses": [
                {
                    "clauseNumber": 19,
                    "clauseTitle": "FUNÇÕES E RESPONSABILIDADES AO ABRIGO DO RGPD",
                    "bodyHtml": "<p>As partes reconhecem que podem atuar como responsáveis pelo tratamento independentes relativamente às respetivas atividades de tratamento e, quando aplicável, como responsáveis conjuntos pelo tratamento ou subcontratantes apenas quando seja acordado por escrito um instrumento separado de tratamento de dados ou de responsabilidade conjunta. O Gestor de Frota é responsável independente pelo tratamento dos dados pessoais dos estafetas que recolhe, utiliza, verifica, conserva ou partilha para fins de recrutamento, pagamento, fiscalidade, seguros e conformidade.</p><p>O Gestor de Frota deve cumprir o Regulamento (UE) 2016/679 (RGPD), a Lei n.º 58/2019 e todas as regras de privacidade aplicáveis. Tal inclui dispor de fundamento de licitude para o tratamento, emitir avisos de privacidade, limitar a conservação, respeitar os direitos dos titulares dos dados, implementar medidas técnicas e organizativas de segurança adequadas e assegurar transferências lícitas e confidencialidade.</p>"
                },
                {
                    "clauseNumber": 20,
                    "clauseTitle": "VIOLAÇÕES DE DADOS",
                    "bodyHtml": "<p>O Gestor de Frota deve notificar a DeliGo sem demora injustificada e, em qualquer caso, no prazo de 24 horas após tomar conhecimento de qualquer violação de dados pessoais, incidente de segurança, perda de dados, acesso não autorizado, incidente de ransomware ou quebra de confidencialidade que possa afetar a DeliGo, a Plataforma, os clientes, os comerciantes, os estafetas ou os reguladores. O Gestor de Frota cooperará nas medidas de investigação, mitigação, notificação e correção.</p>"
                },
                {
                    "clauseNumber": 21,
                    "clauseTitle": "REGISTOS ELETRÓNICOS E PROVA",
                    "bodyHtml": "<p>O Gestor de Frota aceita que os registos eletrónicos, incluindo aceitação por clickwrap, assinaturas eletrónicas, carimbos temporais, endereços IP, dados de GPS, dados de dispositivo, registos de entrega, registos de conversa, registos de apoio, identificadores de conta, registos do painel, sinais de fraude, registos de pagamento e versões de políticas aceites, podem ser utilizados como prova em litígios, investigações, auditorias e processos judiciais, sem prejuízo da lei imperativa.</p>"
                },
                {
                    "clauseNumber": 22,
                    "clauseTitle": "CONFIDENCIALIDADE",
                    "bodyHtml": "<p>Cada parte manterá confidencial a informação não pública da outra, incluindo taxas de comissão, dados de pagamento, processos operacionais, dados da plataforma, algoritmos, informação de clientes, informação de comerciantes, relatórios DAC7, planos de negócio, software e informação técnica. As obrigações de confidencialidade subsistem por cinco anos após a cessação, e os segredos comerciais permanecem protegidos enquanto mantiverem essa natureza.</p>"
                },
                {
                    "clauseNumber": 23,
                    "clauseTitle": "LICENÇA DE PROPRIEDADE INTELECTUAL",
                    "bodyHtml": "<p>A DeliGo conserva todos os direitos sobre as suas marcas, logótipos, software, tecnologia, designs, dados, painéis, documentação e materiais da plataforma. A DeliGo concede ao Gestor de Frota uma licença limitada, não exclusiva, intransmissível e revogável para utilizar a marca aprovada da DeliGo exclusivamente para as atividades autorizadas na Plataforma. O Gestor de Frota não pode registar, copiar, modificar, utilizar indevidamente ou contestar a propriedade intelectual da DeliGo.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE F — DSA, PROTEÇÃO DO CONSUMIDOR, FRAUDE E SEGURANÇA",
            "clauses": [
                {
                    "clauseNumber": 24,
                    "clauseTitle": "DSA E PROCEDIMENTOS DE RECLAMAÇÃO DA PLATAFORMA",
                    "bodyHtml": "<p>Sempre que a DeliGo esteja obrigada a prestar notificação, fundamentação, tratamento de reclamações, vias de recurso, denúncia de conteúdos ilegais ou outros mecanismos de transparência ao abrigo do Regulamento dos Serviços Digitais (DSA) ou da legislação de plataformas aplicável, o Gestor de Frota aceita cooperar e utilizar os procedimentos disponibilizados pela DeliGo. A DeliGo pode remover, restringir, suspender ou desativar contas, anúncios, conteúdos ou acessos sempre que tal seja exigido ou permitido por lei, política, segurança, prevenção de fraude ou requisitos de integridade da plataforma.</p>"
                },
                {
                    "clauseNumber": 25,
                    "clauseTitle": "PROTEÇÃO DO CONSUMIDOR E PADRÕES DE SERVIÇO",
                    "bodyHtml": "<p>O Gestor de Frota deve assegurar que os seus estafetas prestam os serviços de forma profissional, segura e em conformidade com as regras de proteção do consumidor portuguesas e da UE, as regras de segurança alimentar quando aplicáveis, as instruções dos comerciantes, as expetativas de apoio ao cliente, as obrigações de não discriminação e os padrões de serviço da DeliGo.</p>"
                },
                {
                    "clauseNumber": 26,
                    "clauseTitle": "ANTIFRAUDE E SEGURANÇA",
                    "bodyHtml": "<p>O Gestor de Frota não deve praticar, facilitar, ignorar ou tolerar comportamentos fraudulentos, abusivos, enganosos, inseguros ou manipulativos, incluindo entregas falsas, falsificação de GPS (GPS spoofing), partilha de contas, fraude de identidade, contas de estafeta falsas, abuso de contas múltiplas, captação automatizada de encomendas, manipulação de rendimentos ou avaliações, reclamações fabricadas, conluio, abuso de estornos, recolha não autorizada de dados (scraping), acesso não autorizado, adulteração de dispositivos ou utilização indevida de informação confidencial.</p><p>A DeliGo pode investigar, suspender, congelar ganhos, reter fundos, compensar perdas, solicitar provas, cessar o acesso, notificar as autoridades e recuperar perdas sempre que se suspeite ou confirme fraude, abuso, risco de segurança ou incumprimento grave.</p>"
                },
                {
                    "clauseNumber": 27,
                    "clauseTitle": "DENÚNCIA DE IRREGULARIDADES (WHISTLEBLOWING) E COMUNICAÇÃO",
                    "bodyHtml": "<p>A DeliGo pode manter canais confidenciais de comunicação para suspeitas de fraude, corrupção, assédio, discriminação, riscos de segurança, violações de dados, evasão fiscal, violações laborais ou outras condutas ilegais. O Gestor de Frota não retaliará contra quem comunique preocupações de boa-fé.</p>"
                },
                {
                    "clauseNumber": 28,
                    "clauseTitle": "NÃO DISCRIMINAÇÃO E ESG",
                    "bodyHtml": "<p>O Gestor de Frota não discriminará clientes, comerciantes, estafetas, trabalhadores, candidatos ou pessoal da DeliGo em razão da raça, etnia, nacionalidade, religião, deficiência, idade, género, orientação sexual, convicção política, atividade sindical ou qualquer característica protegida. O Gestor de Frota atuará de forma responsável quanto à segurança, ao impacto ambiental, ao emprego lícito e à conduta empresarial ética.</p>"
                }
            ]
        },
        {
            "partTitle": "PARTE G — AUDITORIA, RESPONSABILIDADE, CESSAÇÃO E DISPOSIÇÕES FINAIS",
            "clauses": [
                {
                    "clauseNumber": 29,
                    "clauseTitle": "AUDITORIA E PEDIDOS DE DOCUMENTOS",
                    "bodyHtml": "<p>A DeliGo pode solicitar documentos, declarações, registos, certidões, confirmações fiscais, prova de seguro, registos de verificação de estafetas, documentos KYC, comprovativo de IBAN, licenças, relatórios de acidentes, registos de reclamações e provas de conformidade razoavelmente necessárias para verificar o cumprimento do presente Acordo, da política da DeliGo, das regras da plataforma, dos requisitos bancários, da diligência devida de investidores ou da Lei Aplicável. A falta de apresentação de documentos pode resultar em suspensão, retenção ou cessação.</p>"
                },
                {
                    "clauseNumber": 30,
                    "clauseTitle": "LIMITAÇÃO DE RESPONSABILIDADE",
                    "bodyHtml": "<p>Na máxima medida permitida pela lei portuguesa e da UE, a DeliGo não será responsável por danos indiretos, consequenciais, incidentais, especiais, punitivos, lucros cessantes, perda de rendimentos, perda de oportunidade, perda de reputação (goodwill) ou danos por indisponibilidade da plataforma. A DeliGo não garante um número mínimo de encomendas, volume de entregas, ganhos, disponibilidade, posicionamento (ranking), visibilidade, procura de clientes ou serviço ininterrupto.</p><p>A responsabilidade agregada da DeliGo perante o Gestor de Frota não excederá o maior dos seguintes valores: 5 000 € ou o montante total pago pela DeliGo ao Gestor de Frota nos três meses anteriores à reclamação, exceto quando a lei imperativa não permita tal limitação.</p>"
                },
                {
                    "clauseNumber": 31,
                    "clauseTitle": "INDEMNIZAÇÃO",
                    "bodyHtml": "<p>O Gestor de Frota indemnizará, defenderá e isentará a DeliGo, os seus administradores, dirigentes, trabalhadores, contratantes, agentes, afiliadas e representantes de quaisquer reclamações, coimas, sanções, danos, custos, honorários legais, perdas e responsabilidades decorrentes do incumprimento do presente Acordo pelo Gestor de Frota, da violação da lei, das relações com estafetas, dos pagamentos a estafetas, de reclamações laborais ou de segurança social, de falhas fiscais, de falhas de seguro, de acidentes, de lesões, de fraude, de violações de proteção de dados, de reclamações de consumidores ou da utilização indevida da propriedade intelectual da DeliGo.</p>"
                },
                {
                    "clauseNumber": 32,
                    "clauseTitle": "FORÇA MAIOR E DISPONIBILIDADE DA PLATAFORMA",
                    "bodyHtml": "<p>Nenhuma das partes é responsável por falhas ou atrasos causados por eventos fora do seu controlo razoável, incluindo catástrofes naturais, guerra, terrorismo, pandemias, greves, atos governamentais, falhas de internet, indisponibilidade de fornecedores de cloud, falhas de processadores de pagamento, ciberataques, falhas de sistemas de IA, falhas de serviços públicos ou restrições regulatórias. Se tal evento persistir por mais de 30 dias consecutivos, qualquer das partes pode cessar o Acordo mediante notificação escrita, sem prejuízo das obrigações já vencidas.</p>"
                },
                {
                    "clauseNumber": 33,
                    "clauseTitle": "NÃO ALICIAMENTO E NÃO CONTORNO (NON-CIRCUMVENTION)",
                    "bodyHtml": "<p>Durante a vigência e por 12 meses após a cessação, o Gestor de Frota não utilizará informação confidencial, dados de clientes, dados de comerciantes, apresentações de estafetas, informação de preços, acesso à plataforma ou conhecimento operacional da DeliGo para contornar a comissão da DeliGo, desviar encomendas da Plataforma, aliciar pessoal da DeliGo para fins concorrenciais ou estabelecer regimes concorrentes baseados em informação protegida da DeliGo. Esta cláusula será aplicada na máxima medida permitida pela lei portuguesa e reduzida, em vez de eliminada, caso seja considerada excessiva.</p>"
                },
                {
                    "clauseNumber": 34,
                    "clauseTitle": "SUSPENSÃO E CESSAÇÃO",
                    "bodyHtml": "<p>A DeliGo pode suspender ou cessar a conta do Gestor de Frota por incumprimento, fraude, risco de segurança, reclamações repetidas, caducidade de seguro, perda de licença, falta de apresentação de documentos, informação DAC7 inexata, investigação regulatória, risco de sanções, falha de AML/KYC, atividade criminosa, violação grave de dados ou má conduta grave na plataforma.</p><p>A DeliGo pode cessar imediatamente em caso de fraude, conduta criminosa, violação grave de segurança, violação de sanções ou risco material de conformidade.</p><p>O Gestor de Frota pode cessar mediante notificação escrita com 30 dias de antecedência para contact@deligo.pt. Os montantes em dívida não contestados, após deduções e ajustamentos, serão liquidados no prazo de 30 dias após a cessação.</p>"
                },
                {
                    "clauseNumber": 35,
                    "clauseTitle": "ALTERAÇÕES E MODIFICAÇÕES DA PLATAFORMA",
                    "bodyHtml": "<p>A DeliGo pode alterar o presente Acordo, as políticas, as funcionalidades, os mecanismos de preços, as estruturas de comissão, os algoritmos, os requisitos de qualidade, os padrões de integração e os procedimentos operacionais mediante aviso razoável sempre que praticável, e imediatamente quando exigido por razões legais, fiscais, de segurança, de fraude, de segurança informática ou regulatórias. A continuação da utilização após a data de entrada em vigor constitui aceitação.</p>"
                },
                {
                    "clauseNumber": 36,
                    "clauseTitle": "RESOLUÇÃO DE LITÍGIOS",
                    "forcePageBreakBefore": true,
                    "bodyHtml": "<p>Antes de instaurar uma ação judicial, as partes procurarão uma negociação de boa-fé durante 30 dias. Não havendo resolução, qualquer das partes pode propor mediação em Lisboa. Nada impede o recurso a providências cautelares urgentes, recuperação de dívidas, ação por fraude, cooperação regulatória ou qualquer recurso legal imperativo.</p>"
                },
                {
                    "clauseNumber": 37,
                    "clauseTitle": "ACORDO INTEGRAL, SALVAGUARDA E SUBSISTÊNCIA",
                    "bodyHtml": "<p>O presente Acordo, em conjunto com a Política de Privacidade do Gestor de Frota, as políticas da plataforma, os formulários de integração, os documentos de tratamento de dados e os anexos comerciais escritos, constitui o acordo integral entre as partes. Se alguma disposição for inválida ou inexequível, as restantes permanecem em vigor. As cláusulas relativas a pagamento, fiscalidade, DAC7, auditoria, confidencialidade, propriedade intelectual, proteção de dados, indemnização, limitação de responsabilidade, não aliciamento, fraude, resolução de litígios e prova eletrónica subsistem após a cessação.</p>"
                },
                {
                    "clauseNumber": 38,
                    "clauseTitle": "CONTACTOS E NOTIFICAÇÕES",
                    "bodyHtml": "<p>As notificações à DeliGo devem ser enviadas para contact@deligo.pt e/ou para PIXELMIRACLE LDA, Rua Joaquim Agostinho 16C, 1750-126 Lisboa, Portugal. A DeliGo pode enviar notificações por email, notificação no painel, notificação na aplicação, plataforma de assinatura eletrónica ou outros contactos registados na conta do Gestor de Frota.</p>"
                }
            ]
        }
    ]
};
--
-- PostgreSQL database dump
--

\restrict Rt1Hg7R8U614oARoIkjl6udOAIwyVo3s9MJJG7xyQaBBL4rfUuF90mncFGcYkzR

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: ConfigCategory; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ConfigCategory" AS ENUM (
    'PROFILE_SERIES',
    'FRAME_COLOR',
    'SURFACE_TREATMENT',
    'GLASS_SPECIFICATION',
    'HARDWARE_BRAND',
    'SCREEN_TYPE',
    'INSTALLATION_METHOD',
    'CERTIFICATION',
    'PRODUCT_TYPE',
    'CURRENCY',
    'TRADE_TERM',
    'PAYMENT_TERM',
    'PROJECT_TYPE',
    'PROJECT_STAGE',
    'CLIENT_TYPE',
    'LEAD_SOURCE',
    'OPENING_WAY',
    'QUOTE_VALIDITY'
);


ALTER TYPE public."ConfigCategory" OWNER TO postgres;

--
-- Name: QuotationStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."QuotationStatus" AS ENUM (
    'DRAFT',
    'GENERATED',
    'CANCELLED'
);


ALTER TYPE public."QuotationStatus" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'SALES'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: bank_accounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bank_accounts (
    id text NOT NULL,
    "bankName" text NOT NULL,
    "accountName" text NOT NULL,
    "accountNumber" text NOT NULL,
    "swiftCode" text,
    "bankAddress" text,
    notes text,
    "isDefault" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.bank_accounts OWNER TO postgres;

--
-- Name: company_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.company_info (
    id text NOT NULL,
    "logoUrl" text,
    name text NOT NULL,
    address text,
    website text,
    phone text,
    email text,
    "certificationsText" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.company_info OWNER TO postgres;

--
-- Name: configuration_options; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.configuration_options (
    id text NOT NULL,
    category public."ConfigCategory" NOT NULL,
    value text NOT NULL,
    label text NOT NULL,
    "labelEn" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.configuration_options OWNER TO postgres;

--
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id text NOT NULL,
    name text NOT NULL,
    "companyName" text,
    country text NOT NULL,
    city text,
    email text,
    whatsapp text,
    "clientType" text,
    "leadSource" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- Name: price_rules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.price_rules (
    id text NOT NULL,
    "productType" text NOT NULL,
    "profileSeries" text,
    "baseUnitPrice" numeric(12,2) NOT NULL,
    "minArea" numeric(10,4),
    "maxArea" numeric(10,4),
    notes text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.price_rules OWNER TO postgres;

--
-- Name: quotation_item_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_item_images (
    id text NOT NULL,
    "filePath" text NOT NULL,
    description text,
    "isTbc" boolean DEFAULT false NOT NULL,
    "tbcNotes" text,
    "sortOrder" integer DEFAULT 0 NOT NULL,
    "quotationItemId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotation_item_images OWNER TO postgres;

--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_items (
    id text NOT NULL,
    "itemNo" integer NOT NULL,
    "windowDoorId" text,
    "productType" text NOT NULL,
    width integer,
    height integer,
    quantity integer DEFAULT 1 NOT NULL,
    area numeric(10,4),
    "finalUnitPrice" numeric(12,2),
    "finalAmount" numeric(12,2),
    "openingWay" text,
    notes text,
    "quotationId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotation_items OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id text NOT NULL,
    "quoteNo" text NOT NULL,
    status public."QuotationStatus" DEFAULT 'DRAFT'::public."QuotationStatus" NOT NULL,
    "clientName" text NOT NULL,
    "companyName" text,
    country text NOT NULL,
    city text,
    "clientEmail" text,
    "clientWhatsapp" text,
    "clientType" text,
    "leadSource" text,
    "projectName" text NOT NULL,
    "projectAddress" text,
    "projectType" text,
    "projectStage" text,
    "hasDrawings" boolean DEFAULT false NOT NULL,
    "expectedPurchaseTime" text,
    "quoteDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "quoteValidity" text,
    currency text DEFAULT 'USD'::text NOT NULL,
    "tradeTerm" text DEFAULT 'EXW'::text NOT NULL,
    "productionLeadTime" text,
    "paymentTerm" text,
    "profileSeries" text,
    "frameColor" text,
    "surfaceTreatment" text,
    "glassSpecification" text,
    "hardwareBrand" text,
    "screenType" text,
    "installationMethod" text,
    certifications text[],
    "totalArea" numeric(10,4),
    "productSubtotal" numeric(12,2),
    "accessoriesPackingFee" numeric(12,2),
    "shippingCost" numeric(12,2),
    discount numeric(12,2),
    "grandTotal" numeric(12,2),
    "termsAndConditions" text,
    notes text,
    "tbcSummary" text,
    "createdById" text NOT NULL,
    "customerId" text,
    "bankAccountId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'SALES'::public."UserRole" NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f5c2cb38-dce6-4915-8965-bdc939ea4cf4	bbdf3c7b7b1346f9a8e69a9115c5afa16cb96d51e21dafd996be8115b1d41d45	2026-05-17 09:19:48.340023+00	20260517091504_init	\N	\N	2026-05-17 09:19:48.285182+00	1
eae779d1-3643-412c-b52a-03d4f3277bea	ae6f36b033503347685028db1fa8dbb3efad15dc6137357759352882940167c1	2026-05-18 09:31:37.820058+00	20260518093137_add_quote_validity_to_config_category	\N	\N	2026-05-18 09:31:37.817876+00	1
\.


--
-- Data for Name: bank_accounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bank_accounts (id, "bankName", "accountName", "accountNumber", "swiftCode", "bankAddress", notes, "isDefault", "createdAt", "updatedAt") FROM stdin;
3bf4461c-507c-4b0b-91de-febf251f62ca	DBS Bank (Hong Kong) Limited	Boswindor Building Materials Limited	79687150498	DHBKHKHH	11th Floor, The Center, 99 Queen's Road Central, Central, Hong Kong	\N	t	2026-05-19 01:56:42.456	2026-05-19 01:56:42.456
\.


--
-- Data for Name: company_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.company_info (id, "logoUrl", name, address, website, phone, email, "certificationsText", "createdAt", "updatedAt") FROM stdin;
ffb16747-e8fc-4c51-a0b5-51605e4939ed	\N	Boswindor Building Materials Limited	No.6, Dongfeng Road, Songxia Industrial Park, Nanhai District, Foshan, Guangdong, China	boswindor.com	+86 17329524698	kai.liu@boswindor.com	AS2047, AS1288	2026-05-19 01:56:28.293	2026-05-19 01:56:28.293
\.


--
-- Data for Name: configuration_options; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.configuration_options (id, category, value, label, "labelEn", "isActive", "sortOrder", "createdAt", "updatedAt") FROM stdin;
ec594c08-e659-48f0-b55a-be4ff951aeb3	CURRENCY	USD	USD	\N	t	0	2026-05-17 09:19:55.851	2026-05-17 09:19:55.851
11576a75-0381-4442-94bd-28fa7de8cf2a	CURRENCY	AUD	AUD	\N	t	0	2026-05-17 09:19:55.854	2026-05-17 09:19:55.854
e6e7f627-6464-4362-ba84-760ffa37fa7c	CURRENCY	EUR	EUR	\N	t	0	2026-05-17 09:19:55.856	2026-05-17 09:19:55.856
2be21ec5-9a3e-48cb-9014-23408615d585	CURRENCY	GBP	GBP	\N	t	0	2026-05-17 09:19:55.858	2026-05-17 09:19:55.858
30f88ce8-821d-450c-8450-805d5fe359a9	TRADE_TERM	EXW	EXW	\N	t	0	2026-05-17 09:19:55.862	2026-05-17 09:19:55.862
21150e1b-1b32-4880-822a-044a1d03d057	TRADE_TERM	FOB	FOB	\N	t	0	2026-05-17 09:19:55.864	2026-05-17 09:19:55.864
200046ab-af8b-467c-9f1d-f6f21dd44498	TRADE_TERM	CIF	CIF	\N	t	0	2026-05-17 09:19:55.866	2026-05-17 09:19:55.866
a1d21d80-a9ab-4059-b864-bf82c58a482a	TRADE_TERM	DDP	DDP	\N	t	0	2026-05-17 09:19:55.869	2026-05-17 09:19:55.869
2c8acf94-dea3-413f-a53a-1d7648565aae	CLIENT_TYPE	Builder	Builder	\N	t	0	2026-05-17 09:19:55.873	2026-05-17 09:19:55.873
81076a5e-7a4b-4c48-ac6c-b3ac6f9a6007	CLIENT_TYPE	Contractor	Contractor	\N	t	0	2026-05-17 09:19:55.874	2026-05-17 09:19:55.874
2bca9466-4d7d-448a-820e-75ff37b8e1dd	CLIENT_TYPE	Homeowner	Homeowner	\N	t	0	2026-05-17 09:19:55.877	2026-05-17 09:19:55.877
c4bab664-b3a1-45d9-9499-cbbf82ec9111	LEAD_SOURCE	Facebook	Facebook	\N	t	0	2026-05-17 09:19:55.88	2026-05-17 09:19:55.88
0973a369-03b1-4be7-a49c-d1c0c9c0b230	LEAD_SOURCE	Website	Website	\N	t	0	2026-05-17 09:19:55.882	2026-05-17 09:19:55.882
64457968-7b98-45a1-a327-0ee44f2550b1	LEAD_SOURCE	Exhibition	Exhibition	\N	t	0	2026-05-17 09:19:55.884	2026-05-17 09:19:55.884
bbba153a-26a4-4be7-8c87-66aff2bca5eb	PROJECT_TYPE	Villa	Villa	\N	t	0	2026-05-17 09:19:55.887	2026-05-17 09:19:55.887
8c04d84f-834d-406f-974a-9b7b93aa026b	PROJECT_TYPE	Apartment	Apartment	\N	t	0	2026-05-17 09:19:55.889	2026-05-17 09:19:55.889
a06f199e-021c-4f43-a737-9aaf44c0397d	PROJECT_TYPE	Commercial	Commercial	\N	t	0	2026-05-17 09:19:55.891	2026-05-17 09:19:55.891
4615ab7c-e4ed-4faa-8185-ff1fc4b4a001	PRODUCT_TYPE	Sliding Window	Sliding Window	\N	t	0	2026-05-17 09:19:55.894	2026-05-17 09:19:55.894
08022319-c6de-47d8-9605-10abce0fbea9	PRODUCT_TYPE	Fixed Window	Fixed Window	\N	t	0	2026-05-17 09:19:55.896	2026-05-17 09:19:55.896
898348a7-0efd-4da5-ad6a-92883e4a40f8	PRODUCT_TYPE	Casement Window	Casement Window	\N	t	0	2026-05-17 09:19:55.898	2026-05-17 09:19:55.898
2f7b8ff9-722e-4fc0-ae3d-5d1351185b4b	PRODUCT_TYPE	Sliding Door	Sliding Door	\N	t	0	2026-05-17 09:19:55.9	2026-05-17 09:19:55.9
f6b94337-34f0-4425-a3ad-64e1ef1dff1e	PRODUCT_TYPE	Folding Door	Folding Door	\N	t	0	2026-05-17 09:19:55.902	2026-05-17 09:19:55.902
51c10b1d-3a00-4162-9199-73599010dbc5	SURFACE_TREATMENT	Powder Coating	Powder Coating	\N	t	0	2026-05-17 09:19:55.905	2026-05-17 09:19:55.905
5a7e66d3-5ea4-4a72-8d88-34deae4c9e8d	SURFACE_TREATMENT	Anodized	Anodized	\N	t	0	2026-05-17 09:19:55.907	2026-05-17 09:19:55.907
\.


--
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, "companyName", country, city, email, whatsapp, "clientType", "leadSource", "createdById", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: price_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.price_rules (id, "productType", "profileSeries", "baseUnitPrice", "minArea", "maxArea", notes, "isActive", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quotation_item_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_item_images (id, "filePath", description, "isTbc", "tbcNotes", "sortOrder", "quotationItemId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_items (id, "itemNo", "windowDoorId", "productType", width, height, quantity, area, "finalUnitPrice", "finalAmount", "openingWay", notes, "quotationId", "createdAt", "updatedAt") FROM stdin;
f22c74a3-7f04-4e39-b408-a6080cd054d6	1	\N	AS118 Series SLIDING WINDOW (With Bars)	1800	1200	1	2.1600	747.08	747.08	\N	Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.312	2026-05-19 02:15:08.312
fec05971-3055-42ab-a3ee-75b82960248f	2	\N	AS118 Series SLIDING WINDOW (With Bars)	1800	1700	2	6.1200	1058.36	2116.72	\N	Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.316	2026-05-19 02:15:08.316
758f73db-b7b9-41c1-b352-6191fc6e7826	3	\N	AS118 Series SLIDING WINDOW (With Bars)	2400	1400	1	3.3600	1162.12	1162.12	\N	Thermal Break Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+16A Argon+5mm+0.76pvb+5mm Laminated. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.318	2026-05-19 02:15:08.318
3798e103-f983-4117-91bc-a9bbd0240105	4	\N	TM100 Series FIXED WINDOW (With Bars)	1800	2400	1	4.3200	686.19	686.19	\N	Aluminum 2.0mm, Matt Black. Glass: 6mmLow-e+12A Argon+6mm Double Clear Tempered. No Flyscreen.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.32	2026-05-19 02:15:08.32
41dcada6-ed47-4611-a443-6a406e2182f7	5	\N	YSH85B Series SINGLE-HUNG WINDOW (With Bars)	2095	1600	1	3.3520	1447.83	1447.83	\N	Aluminum 1.4mm, Matt Black. Hardware: Custom Brand. Glass: 6mmLow-e+10A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.322	2026-05-19 02:15:08.322
18f9205e-26e0-4ea5-bffb-bc3b5ac3e4d4	6	\N	TM100 Series SWING DOOR (With Bars)	3395	2400	1	8.1480	2132.28	2132.28	\N	Aluminum 2.0mm, Matt Black. Hardware: Kinlong Brand. Glass: 6mmLow-e+13A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.325	2026-05-19 02:15:08.325
12c9d179-4efb-43d6-8a99-e47cc84dd629	7	\N	100 Series SLIDING DOOR (With Bars)	6150	2400	1	14.7600	3411.79	3411.79	\N	Aluminum 2.0mm, Matt Black. Hardware: Bonway Brand. Glass: 6mmLow-e+10A Argon+6mm Double Clear Tempered. Flyscreen: Stainless Steel.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.328	2026-05-19 02:15:08.328
14e137c8-4f7e-4184-862b-5f3266baada7	8	\N	100 Series SKYLIGHT	1500	2000	4	12.0000	1560.87	6243.48	\N	Aluminum 2.0mm, Matt Black. Hardware: Motorised Blind. Glass: 6mmLow-e+12A Argon+6mm+1.14pvb+6mm Laminated. Flyscreen: Nylon.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.331	2026-05-19 02:15:08.331
2dd59d9c-90c6-48b2-9f70-ada428020058	9	\N	100 Series SKYLIGHT	900	1500	2	2.7000	780.52	1561.04	\N	Aluminum 2.0mm, Matt Black. Hardware: Motorised Blind. Glass: 6mmLow-e+12A Argon+6mm+1.14pvb+6mm Laminated. Flyscreen: Nylon.	36f21360-971d-4130-8ffa-9d66877596f7	2026-05-19 02:15:08.332	2026-05-19 02:15:08.332
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, "quoteNo", status, "clientName", "companyName", country, city, "clientEmail", "clientWhatsapp", "clientType", "leadSource", "projectName", "projectAddress", "projectType", "projectStage", "hasDrawings", "expectedPurchaseTime", "quoteDate", "quoteValidity", currency, "tradeTerm", "productionLeadTime", "paymentTerm", "profileSeries", "frameColor", "surfaceTreatment", "glassSpecification", "hardwareBrand", "screenType", "installationMethod", certifications, "totalArea", "productSubtotal", "accessoriesPackingFee", "shippingCost", discount, "grandTotal", "termsAndConditions", notes, "tbcSummary", "createdById", "customerId", "bankAccountId", "createdAt", "updatedAt") FROM stdin;
36f21360-971d-4130-8ffa-9d66877596f7	BW-Q-20260513-001	GENERATED	Sergej Stevanovic	Sergej Stevanovic Pty Ltd	Australia	Sydney	sergej@example.com	+61 412 345 678	End Customer	Email Inquiry	Sydney Rosebery Residence	Sydney, Suburb Rosebery	Residential	Design Phase	t	Within 2 months	2026-05-13 00:00:00	30 days	AUD	DDP	35 Calendar Days	1. T/T with 100% Pre-payment for PO amount less than 5000 USD\n2. T/T with 50% deposit and balance before shipment for PO amount over 5000 USD	AS118 / TM100 / YSH85B / 100 Series	Matt Black (Powder Coated)	Powder Coated	6mmLow-e + Argon gas + 6mm Double Clear / Laminated Tempered	Cmech / Kinlong / Bonway / Custom	Stainless Steel / Nylon	Standard Installation	{AS2047,AS1288}	56.9200	19508.53	2955.07	2992.00	0.00	25455.60	1. The Aluminium profile color is Customized, all the handle and hinge color is Silver or Black, all the accessories are included;\n2. The production is based on the specification provided by customer;\n3. Standard Package: foam plastic inside and carton outside.\n4. Our doors and windows come with a standard warranty of 10 years. If any quality issues arise during this period, we will provide free replacements.\n5. All products comply with AS2047 and AS1288 certifications. If installation fails due to certification issues, resulting in acceptance testing failure, our company will refund the full amount.	Dear Customer, any change of our company bank account will be issued with our official document and informed by phone call. Please don't make payment to any other account without our confirmation. Thanks!		365cf73c-d9fb-423b-b429-d85355cfa417	\N	3bf4461c-507c-4b0b-91de-febf251f62ca	2026-05-19 02:15:08.306	2026-05-19 02:15:08.306
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, name, password, role, "isActive", "createdAt", "updatedAt") FROM stdin;
365cf73c-d9fb-423b-b429-d85355cfa417	admin@boswindor.com	Administrator	$2b$10$Wi9QqDm0y2d6DG4yYjzY9e0Y3ZNGbro/YbAoKoolELFlvkaLUFwSi	ADMIN	t	2026-05-17 09:19:55.739	2026-05-17 09:19:55.739
7f725c04-93ed-4026-9be5-a97399cbfbe3	sales@boswindor.com	Sales User	$2b$10$NkqvGeVYQyjaG2pEKqQp7e5p5rdi22hb1ajFKkCKFVDh9FtrahAWq	SALES	t	2026-05-17 09:19:55.842	2026-05-17 09:19:55.842
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: bank_accounts bank_accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bank_accounts
    ADD CONSTRAINT bank_accounts_pkey PRIMARY KEY (id);


--
-- Name: company_info company_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.company_info
    ADD CONSTRAINT company_info_pkey PRIMARY KEY (id);


--
-- Name: configuration_options configuration_options_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.configuration_options
    ADD CONSTRAINT configuration_options_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: price_rules price_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.price_rules
    ADD CONSTRAINT price_rules_pkey PRIMARY KEY (id);


--
-- Name: quotation_item_images quotation_item_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_item_images
    ADD CONSTRAINT quotation_item_images_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: configuration_options_category_value_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX configuration_options_category_value_key ON public.configuration_options USING btree (category, value);


--
-- Name: quotation_items_quotationId_itemNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "quotation_items_quotationId_itemNo_key" ON public.quotation_items USING btree ("quotationId", "itemNo");


--
-- Name: quotations_quoteNo_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "quotations_quoteNo_key" ON public.quotations USING btree ("quoteNo");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: customers customers_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT "customers_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotation_item_images quotation_item_images_quotationItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_item_images
    ADD CONSTRAINT "quotation_item_images_quotationItemId_fkey" FOREIGN KEY ("quotationItemId") REFERENCES public.quotation_items(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotation_items quotation_items_quotationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT "quotation_items_quotationId_fkey" FOREIGN KEY ("quotationId") REFERENCES public.quotations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quotations quotations_bankAccountId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES public.bank_accounts(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: quotations quotations_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: quotations quotations_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT "quotations_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public.customers(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict Rt1Hg7R8U614oARoIkjl6udOAIwyVo3s9MJJG7xyQaBBL4rfUuF90mncFGcYkzR


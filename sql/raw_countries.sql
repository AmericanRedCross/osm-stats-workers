CREATE TABLE raw_countries (
    id SERIAL,
    name text,
    code text NOT NULL UNIQUE,
    PRIMARY KEY(id)
);

COPY raw_countries (id, name, code) FROM stdin;
1	Alaska	USA-AK
2	Alabama	USA-AL
3	Arkansas	USA-AR
4	Arizona	USA-AZ
5	California	USA-CA
6	Colorado	USA-CO
7	Connecticut	USA-CT
8	District of Columbia	USA-DC
9	Delaware	USA-DE
10	Florida	USA-FL
11	Georgia	USA-GA
12	Hawaii	USA-HI
13	Iowa	USA-IA
14	Idaho	USA-ID
15	Illinois	USA-IL
16	Indiana	USA-IN
17	Kansas	USA-KS
18	Kentucky	USA-KY
19	Louisiana	USA-LA
20	Massachusetts	USA-MA
21	Maryland	USA-MD
22	Maine	USA-ME
23	Michigan	USA-MI
24	Minnesota	USA-MN
25	Missouri	USA-MO
26	Mississippi	USA-MS
27	Montana	USA-MT
28	North Carolina	USA-NC
29	North Dakota	USA-ND
30	Nebraska	USA-NE
31	New Hampshire	USA-NH
32	New Jersey	USA-NJ
33	New Mexico	USA-NM
34	Nevada	USA-NV
35	New York	USA-NY
36	Ohio	USA-OH
37	Oklahoma	USA-OK
38	Oregon	USA-OR
39	Pennsylvania	USA-PA
40	Puerto Rico	USA-PR
41	Rhode Island	USA-RI
42	South Carolina	USA-SC
43	South Dakota	USA-SD
44	Tennessee	USA-TN
45	Texas	USA-TX
46	Utah	USA-UT
47	Virginia	USA-VA
48	Vermont	USA-VT
49	Washington	USA-WA
50	Wisconsin	USA-WI
51	West Virginia	USA-WV
52	Wyoming	USA-WY
53	Afghanistan	AFG
54	Angola	AGO
55	Albania	ALB
56	United Arab Emirates	ARE
57	Argentina	ARG
58	Armenia	ARM
59	Antarctica	ATA
60	French Southern and Antarctic Lands	ATF
61	Australia	AUS
62	Austria	AUT
63	Azerbaijan	AZE
64	Burundi	BDI
65	Belgium	BEL
66	Benin	BEN
67	Burkina Faso	BFA
68	Bangladesh	BGD
69	Bulgaria	BGR
70	The Bahamas	BHS
71	Bosnia and Herzegovina	BIH
72	Belarus	BLR
73	Belize	BLZ
74	Bermuda	BMU
75	Bolivia	BOL
76	Brazil	BRA
77	Brunei	BRN
78	Bhutan	BTN
79	Botswana	BWA
80	Central African Republic	CAF
81	Canada	CAN
82	Switzerland	CHE
83	Chile	CHL
84	China	CHN
85	Ivory Coast	CIV
86	Cameroon	CMR
87	Democratic Republic of the Congo	COD
88	Republic of the Congo	COG
89	Colombia	COL
90	Costa Rica	CRI
91	Cuba	CUB
92	Northern Cyprus	CYN
93	Cyprus	CYP
94	Czech Republic	CZE
95	Germany	DEU
96	Djibouti	DJI
97	Denmark	DNK
98	Dominican Republic	DOM
99	Algeria	DZA
100	Ecuador	ECU
101	Egypt	EGY
102	Eritrea	ERI
103	Spain	ESP
104	Estonia	EST
105	Ethiopia	ETH
106	Finland	FIN
107	Fiji	FJI
108	Falkland Islands	FLK
109	France	FRA
110	Gabon	GAB
111	United Kingdom	GBR
112	Georgia	GEO
113	Ghana	GHA
114	Guinea	GIN
115	Gambia	GMB
116	Guinea Bissau	GNB
117	Equatorial Guinea	GNQ
118	Greece	GRC
119	Greenland	GRL
120	Guatemala	GTM
121	French Guiana	GUF
122	Guyana	GUY
123	Honduras	HND
124	Croatia	HRV
125	Haiti	HTI
126	Hungary	HUN
127	Indonesia	IDN
128	India	IND
129	Ireland	IRL
130	Iran	IRN
131	Iraq	IRQ
132	Iceland	ISL
133	Israel	ISR
134	Italy	ITA
135	Jamaica	JAM
136	Jordan	JOR
137	Japan	JPN
138	Kazakhstan	KAZ
139	Kenya	KEN
140	Kyrgyzstan	KGZ
141	Cambodia	KHM
142	South Korea	KOR
143	Kosovo	KOS
144	Kuwait	KWT
145	Laos	LAO
146	Lebanon	LBN
147	Liberia	LBR
148	Libya	LBY
149	Sri Lanka	LKA
150	Lesotho	LSO
151	Lithuania	LTU
152	Luxembourg	LUX
153	Latvia	LVA
154	Morocco	MAR
155	Moldova	MDA
156	Madagascar	MDG
157	Mexico	MEX
158	Macedonia	MKD
159	Mali	MLI
160	Myanmar	MMR
161	Montenegro	MNE
162	Mongolia	MNG
163	Mozambique	MOZ
164	Mauritania	MRT
165	Malawi	MWI
166	Singapore	SGP
167	Malaysia	MYS
168	Namibia	NAM
169	New Caledonia	NCL
170	Niger	NER
171	Nigeria	NGA
172	Nicaragua	NIC
173	Netherlands	NLD
174	Norway	NOR
175	Nepal	NPL
176	New Zealand	NZL
177	Oman	OMN
178	Pakistan	PAK
179	Panama	PAN
180	Peru	PER
181	Philippines	PHL
182	Papua New Guinea	PNG
183	Poland	POL
184	Puerto Rico	PRI
185	North Korea	PRK
186	Portugal	PRT
187	Paraguay	PRY
188	Qatar	QAT
189	Romania	ROU
190	Russia	RUS
191	Rwanda	RWA
192	Western Sahara	ESH
193	Saudi Arabia	SAU
194	Sudan	SDN
195	South Sudan	SDS
196	Senegal	SEN
197	Solomon Islands	SLB
198	Sierra Leone	SLE
199	El Salvador	SLV
201	Somalia	SOM
202	Republic of Serbia	SRB
203	Suriname	SUR
204	Slovakia	SVK
205	Slovenia	SVN
206	Sweden	SWE
207	Swaziland	SWZ
208	Syria	SYR
209	Chad	TCD
210	Togo	TGO
211	Thailand	THA
212	Tajikistan	TJK
213	Turkmenistan	TKM
214	East Timor	TLS
215	Trinidad and Tobago	TTO
216	Tunisia	TUN
217	Turkey	TUR
218	Taiwan	TWN
219	United Republic of Tanzania	TZA
220	Uganda	UGA
221	Ukraine	UKR
222	Uruguay	URY
223	United States of America	USA
224	Uzbekistan	UZB
225	Venezuela	VEN
226	Vietnam	VNM
227	Vanuatu	VUT
228	West Bank	PSE
229	Yemen	YEM
230	South Africa	ZAF
231	Zambia	ZMB
232	Zimbabwe	ZWE
233	\N	ABW
234	\N	AIA
235	\N	ALD
236	\N	AND
237	\N	ASM
238	\N	ATC
239	\N	ATG
240	\N	BHR
241	\N	BJN
242	\N	BLM
243	\N	BRB
244	\N	CLP
245	\N	CNM
246	\N	COK
247	\N	COM
248	\N	CPV
249	\N	CSI
250	\N	CUW
251	\N	CYM
252	\N	DMA
253	\N	ESB
254	\N	FRO
255	\N	FSM
256	\N	GGY
257	\N	GIB
258	\N	GRD
259	\N	GUM
260	\N	HKG
261	\N	HMD
262	\N	IMN
263	\N	IOA
264	\N	IOT
265	\N	JEY
266	\N	KAB
267	\N	KAS
268	\N	KIR
269	\N	KNA
270	\N	LCA
271	\N	LIE
272	\N	MAC
273	\N	MAF
274	\N	MCO
275	\N	MDV
276	\N	MHL
277	\N	MLT
278	\N	MNP
279	\N	MSR
280	\N	MUS
281	\N	NFK
282	\N	NIU
283	\N	NRU
284	\N	PCN
285	\N	PGA
286	\N	PLW
287	\N	PSX
288	\N	PYF
289	\N	SAH
290	\N	SCR
291	\N	SER
292	\N	SGS
293	\N	SHN
294	\N	SMR
295	\N	SOL
296	\N	SPM
297	\N	STP
298	\N	SXM
299	\N	SYC
300	\N	TCA
301	\N	TON
302	\N	TUV
303	\N	UMI
304	\N	USG
305	\N	VAT
306	\N	VCT
307	\N	VGB
308	\N	VIR
309	\N	WLF
310	\N	WSB
311	\N	WSM
\.

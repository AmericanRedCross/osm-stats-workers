CREATE TABLE badges (
    id SERIAL,
    category integer,
    name text,
    level integer,
    PRIMARY KEY(id)
);

COPY badges (id, category, name, level) FROM stdin;
7	3	On Point	1
8	3	On Point	2
9	3	On Point	3
10	4	The Wright Stuff	1
11	4	The Wright Stuff	2
12	4	The Wright Stuff	3
13	5	Field Mapper	1
14	5	Field Mapper	2
15	5	Field Mapper	3
16	6	On The Road Again	1
17	6	On The Road Again	2
18	6	On The Road Again	3
19	7	Long and Winding Road	1
20	7	Long and Winding Road	2
21	7	Long and Winding Road	3
22	8	White Water Rafting	1
23	8	White Water Rafting	2
24	8	White Water Rafting	3
28	10	Task Champion	1
29	10	Task Champion	2
30	10	Task Champion	3
1	1	Road Builder	1
2	1	Road Builder	2
3	1	Road Builder	3
4	2	Road Maintainer	1
5	2	Road Maintainer	2
6	2	Road Maintainer	3
25	9	World Renown	1
26	9	World Renown	2
27	9	World Renown	3
37	13	Mapathoner	1
38	13	Mapathoner	2
39	13	Mapathoner	3
40	14	Consistency	1
41	14	Consistency	2
42	14	Consistency	3
43	15	Year-long Mapper	1
44	15	Year-long Mapper	2
45	15	Year-long Mapper	3
46	16	Crisis Mapping	1
47	17	Red Cross Mapper	1
48	18	MSF Mapper	1
31	11	Scrutinizer	1
32	11	Scrutinizer	2
33	11	Scrutinizer	3
34	12	Awesome JOSM	1
35	12	Awesome JOSM	2
36	12	Awesome JOSM	3
\.

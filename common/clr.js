

const CLR_HSL_CACHE = new Map();
const CLR_LIN = Array.from({ length: 256 }, (_, i) => { let v = i / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
const CLR_SPACES = {
  rgb: { to: c => c, from: c => c },
  linear: { to: c => c.map(v => CLR_LIN[v]), from: c => c.map(clrFromLin) },
  lab: { to: c => clrRgbToLab(...c), from: c => clrLabToRgb(...c) },
  oklab: { to: c => clrRgbToOklab(...c), from: c => clrOklabToRgb(...c) },
  hsl: { to: c => clrRgbToHsl(...c), from: c => clrHslToRgb(...c), hue: 0, chroma: 1, eps: 0.5 },
  lch: { to: c => clrToPolar(clrRgbToLab(...c)), from: c => clrLabToRgb(...clrFromPolar(c)), hue: 2, chroma: 1, eps: 1 },
  oklch: { to: c => clrToPolar(clrRgbToOklab(...c)), from: c => clrOklabToRgb(...clrFromPolar(c)), hue: 2, chroma: 1, eps: 0.004 },
};
var CLR_LAB = {};
const palettes = {
  autumn: ["#7F2D24", "#C45A32", "#E29A3B", "#A77B35", "#5D6541"],
  spring: ["#F2A6B3", "#F4D35E", "#8CCB8B", "#76C7C0", "#B39DDB"],
  winter: ["#EAF4F4", "#A7C7D9", "#5B8FA8", "#344E6C", "#8C8FC7"],
  summer1: ["#FF6B35", "#F7C948", "#65B96E", "#25A9A1", "#3978C5"],
  jungle: ["#183F2B", "#276749", "#4F8A3B", "#9AAB45", "#C17C3A"],
  ocean: ["#0B3C5D", "#146C8E", "#1D9AA6", "#62C5C7", "#B5E2D8"],
  beach: ["#E7B86A", "#F4DDAA", "#F6EBD2", "#78B9C2", "#397A91"],
  children1: ["#FF5A5F", "#FFB000", "#FFE14A", "#35B86B", "#318CE7"],
  vacation1: ["#F06C4E", "#F7B548", "#F5E6A8", "#42B7A5", "#3478A8"],
  microsoft: ["#F25022", "#7FBA00", "#00A4EF", "#FFB900", "#737373"],
  boardgames: ["#7A2E2E", "#D6A84F", "#426B52", "#345B7E", "#E6DCC8"],
  happiness1: ["#FFD166", "#F78C6B", "#EF476F", "#8AC926", "#4CC9F0"],
  children: ["#FF1744", "#FF9100", "#FFEA00", "#00E676", "#2979FF", "#D500F9"],
  summer: ["#FF3D00", "#FFC400", "#76FF03", "#00E5FF", "#651FFF"],
  happiness: ["#FFEA00", "#FF6D00", "#F50057", "#76FF03", "#00B0FF"],
  vacation: ["#FF3D71", "#FF9100", "#FFEA00", "#00E5A8", "#00B0FF", "#7C4DFF"],
};
var ColorByName = Object.freeze({
  "rich_black_fog": "#00000d",
  "black": "#000000",
  "rich_black_fog2": "#000202",
  "imperial_blue": "#002395",
  "blue_ryb": "#0247fe",
  "dark_cerulean": "#004a7c",
  "blue": "#0047ab",
  "bluegreen": "#004d40",
  "midnight_blue2": "#00468c",
  "usafa_blue": "#004f98",
  "medium_teal": "#006666",
  "medium_persian_blue": "#0067a5",
  "dartmouth_green": "#00703c",
  "linkedin_blue": "#0072b1",
  "french_blue": "#0072bb",
  "metallic_seaweed": "#007689",
  "ocean_boat_blue": "#0076c6",
  "pine_green": "#01796f",
  "philippine_green": "#008543",
  "north_texas_green": "#059033",
  "teal_green": "#00897b",
  "boy_red": "#008c9a",
  "microsoft_blue": "#00a2ed",
  "rich_electric_blue": "#008ec9",
  "paolo_veronese_green": "#009b7d",
  "strong_cyan": "#009999",
  "blue_munsell": "#0093af",
  "spring_sky": "#0099ff",
  "green_pantone": "#00ad43",
  "turquoise_surf": "#00bcd4",
  "vivid_teal": "#00bfa5",
  "cyan_process": "#00b7eb",
  "hawaii_blue": "#00c1e9",
  "dark_lime": "#00cc00",
  "vivid_sky_blue": "#00ccff",
  "bright_aqua": "#00f5d4",
  "cyan": "#00ffff",
  "panasonic_blue": "#0040be",
  "absolute_zero": "#0048ba",
  "green": "#008001",
  "azure": "#007fff",
  "persian_green": "#00a693",
  "tiffany_blue": "#02aea8",
  "prussian_blue_color_konjo_iro": "#003171",
  "blue_cola": "#0088dc",
  "generic_viridian": "#007f66",
  "blue_raspberry": "#04c1ea",
  "caribbean_green": "#00cc99",
  "green_blue": "#0665b2",
  "light_blue_silk": "#044f67",
  "vibrant_green": "#06d6a0",
  "dodger_blue": "#0066cc",
  "navy_blue_bellflower": "#091238",
  "greenblue": "#003153",
  "cool_black": "#002e63",
  "catalina_blue": "#062a78",
  "xbox_green": "#0a7c1f",
  "green_munsell": "#00a877",
  "smoky_black": "#100c08",
  "bright_navy_blue": "#1974d2",
  "dark_powder_blue": "#003399",
  "blue_green": "#0d98ba",
  "oxford_blue": "#002147",
  "spiro_disco_ball": "#0fcaff",
  "yankees_blue": "#10203d",
  "royal_blue_dark": "#002366",
  "black_kokushoku": "#171412",
  "lapis_lazuli_japan": "#143c7c",
  "yale_blue": "#0f4d92",
  "denim": "#1560bd",
  "cyan_cornflower_blue": "#1492c4",
  "lightseagreen": "#20b2aa",
  "new_car": "#164aca",
  "dodgerblue": "#1e90ff",
  "dark_imperial_blue": "#00147e",
  "dark_cornflower_blue": "#172b86",
  "weebly_blue": "#2096f3",
  "egyptian_blue": "#1034a6",
  "summer_sky": "#2962ff",
  "true_blue1": "#0073cf",
  "jungle_green": "#009933",
  "greengrey": "#264653",
  "medium_electric_blue": "#035096",
  "mate_black": "#1a191e",
  "saint_patricks_blue": "#23297a",
  "goryeo_storeroom": "#1b2e35",
  "mughal_green": "#1b5e20",
  "spanish_viridian": "#007f5c",
  "denim_blue": "#1d44b3",
  "celtic_blue": "#246bce",
  "licorice": "#1f0b08",
  "black_chestnut": "#252321",
  "japanese_laurel": "#2e7d32",
  "sea_blue": "#006994",
  "button_blue": "#24a0ed",
  "bright_navy": "#000080",
  "lapis_lazuli": "#2167a1",
  "asda_green_2002": "#21b249",
  "flickr_blue": "#2262dd",
  "facebook_blue": "#234096",
  "brilliant_azure": "#3399ff",
  "charleston_green": "#232b2b",
  "illuminating_emerald": "#319177",
  "blue_crayola": "#1f75fe",
  "gunmetal": "#2a3439",
  "green_blue_crayola": "#2887c8",
  "keppel": "#26a69a",
  "light_sky_blue": "#26bfff",
  "legal_dye": "#281010",
  "blue_pigment": "#303f9f",
  "pleasant_green": "#33b64b",
  "pine_tree": "#2a2f23",
  "ink_color_sumi_iro": "#27221f",
  "celadon_green": "#2a898b",
  "dark_gray": "#353535",
  "onyx": "#353839",
  "scorched_brown": "#351f19",
  "ultramarine_blue": "#4166f5",
  "blue_violet": "#2b2028",
  "outer_space_crayola": "#2d383a",
  "charcoal": "#36454f",
  "horsetail": "#2f502a",
  "thousand_herb": "#317589",
  "silk_crepe": "#354e4b",
  "betel_nut": "#33251f",
  "deep_space_sparkle": "#335e68",
  "lincoln_green": "#195905",
  "mediumseagreen": "#3cb371",
  "metallic_green": "#296e01",
  "teal_blue": "#367588",
  "celestial_blue": "#4997d0",
  "verdigris": "#34a9ae",
  "twitter_blue": "#26a7de",
  "vivid_blue_violet": "#3a0ca3",
  "zinnwaldite_brown": "#2c1608",
  "black_coffee": "#3b2f2f",
  "ming": "#36747d",
  "neon_blue": "#1b03a3",
  "black_olive": "#3b3c36",
  "green_cola": "#4c721d",
  "true_blue": "#2d68c4",
  "may_green": "#4c9141",
  "onando": "#364141",
  "iron_head_flower": "#344d56",
  "turquoise": "#40e0d0",
  "indigo_ink_brown": "#393432",
  "violet_blue": "#324ab2",
  "battery_charged_blue": "#1dacd6",
  "jelly_bean_blue": "#3a6f8a",
  "cola": "#3c3024",
  "google_chrome_blue": "#4285f4",
  "picton_blue": "#45b1e8",
  "disappearing_purple": "#3e2230",
  "old_burgundy": "#43302e",
  "bistre": "#3d2b1f",
  "cafe_noir": "#4f3320",
  "rusty_storeroom": "#3a403b",
  "outer_space": "#414a4c",
  "interdimensional_blue": "#410bd3",
  "american_bronze": "#391802",
  "napier_green": "#2a8000",
  "acajou": "#4a261f",
  "tufts_blue": "#3e8ede",
  "zomp": "#39a78e",
  "bleu_de_france": "#42a5f5",
  "kimono_storage": "#3d4c51",
  "winter_sky": "#4396a9",
  "forest_green": "#339933",
  "opposite_flower": "#4d646c",
  "sky_blue": "#45f9ff",
  "dark_electric_blue": "#466b7d",
  "royal_blue_light": "#4169e1",
  "american_purple": "#470344",
  "rusty_storage": "#455859",
  "army_green": "#4b5320",
  "pine_needle": "#484e27",
  "simmered_seaweed_mirucha": "#4c3d30",
  "moonstone": "#3aa8c1",
  "boiled_red_bean_brown": "#4a251a",
  "dull_blue_aonibi": "#4f4944",
  "quartz": "#51484f",
  "light_blue": "#48929b",
  "american_green": "#34b334",
  "light_azure": "#4bc5fc",
  "neon_green": "#39ff14",
  "deep_violet": "#330066",
  "dark_lava": "#483c32",
  "royal_brown": "#503430",
  "blue_lagoon": "#4cb7a5",
  "maximum_blue": "#4dc6e1",
  "sea_serpent": "#4dd0e1",
  "brown_rat_grey": "#4b3c39",
  "maximum_green": "#4e9226",
  "dark_turquoise": "#55b4b0",
  "dark_liver": "#534b4f",
  "military_green": "#5a7247",
  "cadet": "#506d73",
  "english_violet": "#563c5c",
  "fresh_onion_moegi": "#528d30",
  "han_blue": "#446ccf",
  "imperial": "#541e69",
  "weathered_bamboo": "#543121",
  "dark_liver_horses": "#543630",
  "black_coral": "#54626f",
  "stormcloud": "#4f666a",
  "very_light_blue": "#6666ff",
  "plump_purple": "#5731a5",
  "violetblue": "#4424d6",
  "antique_bronze": "#586214",
  "mustard_green": "#586415",
  "olivedrab": "#6b8e23",
  "green_ryb": "#66b032",
  "mantis": "#58bf4e",
  "dimgray": "#696969",
  "darkolivegreen": "#59702c",
  "bayside": "#5fc9bf",
  "desaturated_cyan": "#669999",
  "crystal_blue": "#5a96a8",
  "dark_indigo": "#614e6e",
  "violet_blue_crayola": "#5c6bc0",
  "han_purple": "#5218fa",
  "liver": "#5d4037",
  "umber": "#5d423c",
  "light_royal_blue": "#6699ff",
  "very_light_malachite_green": "#64e986",
  "wenge": "#645452",
  "cadetblue": "#5f9ea0",
  "carolina_blue": "#5fb2de",
  "palatinate_purple": "#600f58",
  "dark_brown": "#603c24",
  "contemplation": "#604338",
  "steel_teal": "#5f8a8b",
  "apple": "#60c14e",
  "blue_jeans": "#5dadec",
  "medium_aquamarine": "#61de9f",
  "sumac_dyed_korozen": "#592b1f",
  "van_dyke_brown": "#63351e",
  "painite": "#633d35",
  "air_force_blue": "#5d8aa8",
  "pale_emerald": "#50c878",
  "slategray": "#708090",
  "mediumaquamarine": "#64dac1",
  "lawn_green": "#58a813",
  "aloewood": "#66361f",
  "delicate_girl_blue": "#6ab2ca",
  "iguana_green": "#66bb6a",
  "sky_blue_crayola": "#66c0e8",
  "nickel": "#727472",
  "purple": "#660066",
  "quincy": "#6a5445",
  "palm_leaf": "#689f38",
  "slate_blue": "#6e81a0",
  "oxley": "#6d9a79",
  "olive_drab": "#669900",
  "moonstone_blue": "#73a9c2",
  "liver_organ": "#6d291a",
  "deep_coffee": "#6d4238",
  "weldon_blue": "#6d94a5",
  "mediumslateblue": "#7b68ee",
  "sap_green": "#507d2a",
  "pastel_green": "#77dd77",
  "electric_sky": "#6fe8fd",
  "dark_silver": "#706c66",
  "moss_green": "#70853b",
  "philippine_bronze": "#713604",
  "aurometalsaurus": "#6e7f80",
  "khaki": "#8d9440",
  "golden_grey_bamboo": "#723f22",
  "lightslategray": "#778899",
  "bole": "#79443b",
  "slateblue": "#7350d3",
  "old_moss_green": "#867e36",
  "siskin_sprout_yellow": "#738613",
  "pale_cyan": "#87d3f8",
  "kenyan_copper": "#751c00",
  "asparagus": "#87a96b",
  "dark_purple": "#7600b3",
  "dove_feather_grey": "#765f57",
  "medium_slate_blue": "#836fff",
  "maya_blue": "#73c2fb",
  "cypress_bark_color": "#77381f",
  "asda_green": "#7dc242",
  "color_of_an_undried_wall": "#785e49",
  "aero": "#7cb9e8",
  "maximum_purple": "#792d85",
  "dark_pastel_purple": "#966fd6",
  "gray": "#808080",
  "heart_gold": "#808000",
  "ceil": "#7986cb",
  "chinese_purple": "#720b98",
  "green_tea": "#824b35",
  "amethyst": "#9966cc",
  "french_sky_blue": "#77b5fe",
  "lye": "#7b5b52",
  "deep_taupe": "#7e5e60",
  "parakeet_blue": "#7eb6ff",
  "guacamole": "#7cb23f",
  "pale_blue_usuao": "#7d8e5f",
  "purple_heart": "#69359c",
  "pewter_blue": "#7eaab3",
  "baby_blue": "#7ec8ee",
  "barn_red": "#7c0a02",
  "russet": "#80461b",
  "pastel_brown": "#836953",
  "microsoft_green": "#7db700",
  "kiwi": "#7fce1a",
  "red_brown1": "#8b352d",
  "titanium": "#878681",
  "pale_lilac": "#9999ff",
  "light_cyan": "#7fcdcd",
  "sheen_green": "#8fd400",
  "middle_blue_green": "#80ddd2",
  "medium_sky_blue": "#80daeb",
  "dark_sky_blue": "#8cbed6",
  "lightskyblue": "#81d7ff",
  "falu_red": "#801818",
  "chocolate_traditional": "#823e00",
  "dark_brown_tangelo": "#88654e",
  "finch_brown": "#825e1d",
  "sen_no_rikyus_tea_rikyucha": "#826b58",
  "yellowgreen": "#9acd32",
  "pearl_aqua": "#82e8d7",
  "yellow_sea_pine_brown": "#83622f",
  "battleship_grey": "#848482",
  "tuscan_red": "#7c4848",
  "spicy_mix": "#8b5f4d",
  "teal_deer": "#99e6b3",
  "rose_taupe": "#905d5d",
  "kobe": "#871e0c",
  "brushwood_dyed_fushizome": "#8c5939",
  "milk_chocolate": "#84563c",
  "bistre_brown": "#875d00",
  "taupe_gray": "#8b8589",
  "morning_blue": "#87a194",
  "french_plum": "#880e4f",
  "willow_grey": "#817b69",
  "middle_grey": "#8b8680",
  "pale_young_green_onion": "#8db255",
  "sparrow_brown": "#893f2e",
  "clove_brown": "#8f583c",
  "medium_violet": "#8954ff",
  "medium_brown": "#996633",
  "roman_silver": "#838996",
  "citrine_brown": "#933709",
  "plum": "#8e4585",
  "saddlebrown": "#8a460a",
  "dark_lemon_lime": "#8bbe1b",
  "blood1": "#8a0303",
  "deep_dumpling": "#8c1d0b",
  "cornflower": "#8cc2ea",
  "violet": "#911eb4",
  "dark_magenta": "#993399",
  "polished_brown": "#985538",
  "cinereous": "#98817b",
  "shadow": "#8a795d",
  "wisteria_purple": "#875f9a",
  "purple_plum": "#903eb3",
  "cadet_grey": "#91a3b0",
  "pale_sky_blue": "#99ccff",
  "vivid_auburn": "#922724",
  "italian_roast": "#91674d",
  "plum_blossom_mouse": "#925849",
  "citron": "#9fa91f",
  "jordy_blue": "#8ab9f1",
  "mardi_gras": "#880085",
  "non_photo_blue": "#a4dded",
  "sangria": "#92000a",
  "brown_traditional": "#964b00",
  "liver_chestnut": "#987456",
  "granny_smith_apple": "#a8e4a0",
  "coconut": "#965a3e",
  "iron": "#a19d94",
  "pomelo": "#96a53c",
  "beaver": "#9f8170",
  "darkgray": "#a0a0a0",
  "cadet_blue_crayola": "#98a8be",
  "acid_green": "#b0bf1a",
  "pale_blue": "#98b4d4",
  "spartan_crimson": "#99130d",
  "purpureus": "#9a4eae",
  "chamoisee": "#a0785a",
  "light_cobalt_blue": "#9aa7ed",
  "pistachio": "#93c572",
  "red_birch": "#9d2b22",
  "walnut_dyed": "#9b6a57",
  "dark_chestnut": "#986960",
  "rapeseed_oil": "#a17917",
  "metallic_sunburst": "#9b782c",
  "crystal": "#a7d8de",
  "red_brown": "#9c3c25",
  "lightblue": "#afd7e9",
  "red_ochre": "#9f5233",
  "gamboge_orange_brown": "#996600",
  "dirt": "#9b7653",
  "inchworm": "#b2ec5d",
  "purple_munsell": "#9f00c5",
  "chrome_aluminum": "#9fa4aa",
  "auburn": "#a52a2a",
  "copper_brown": "#a65f46",
  "metallic_bronze": "#a97142",
  "light_pastel_purple": "#a08ccf",
  "pale_cerulean": "#a0c7e8",
  "june_bud": "#bdda57",
  "olivine": "#9ab973",
  "margarita": "#a1c23c",
  "pastel_blue": "#a1c5cb",
  "chinese_red": "#a22911",
  "chinese_brown": "#ab381f",
  "darkorchid": "#9932cc",
  "dark_gold": "#a2672b",
  "cafe_au_lait": "#a2764a",
  "lenurple": "#a281d0",
  "fresh_air": "#a6e7ff",
  "dark_crimson": "#a30042",
  "sweet_brown": "#a83731",
  "grullo": "#a38e7a",
  "blood": "#a41313",
  "blast_off_bronze": "#a57164",
  "jazzberry_jam": "#a50b5e",
  "metallic_brown": "#ac4313",
  "lavender_purple": "#967bb6",
  "clove_dyed_chojizome": "#a7571f",
  "celeste": "#a7ffeb",
  "dark_candy_apple_red": "#a40000",
  "rufous": "#a81c07",
  "yellow_green_crayola": "#a8ce5f",
  "loquat_tree_brown": "#ab6134",
  "amaranth_deep_purple": "#ab2c5e",
  "medium_carmine": "#ab3f2e",
  "deep_fuchsia": "#ab47bc",
  "light_brown": "#ab580f",
  "vibrant_lavender": "#ab7cf7",
  "pale_fallen_leaves": "#ab872e",
  "ash_gray": "#abb9bb",
  "cambridge_blue": "#a3c1ad",
  "carnelian": "#ad1414",
  "dirty_brown": "#ac5813",
  "rust": "#ad3900",
  "brown_sugar": "#af6e4d",
  "turquoise_green": "#a0d6b4",
  "upsdell_red": "#ae111f",
  "faded_rikyus_tea": "#b0927a",
  "silver_metallic": "#aaa9ad",
  "silver_foil": "#afb1ae",
  "red": "#ff0d0d",
  "raspberry": "#c51162",
  "mordant_red_19": "#ae0c00",
  "firebrick": "#b22222",
  "byzantine": "#bd33a4",
  "windsor_tan": "#a75502",
  "philippine_gold": "#af6300",
  "copper_penny": "#af7464",
  "spicy_red_brown": "#bb5d42",
  "light_taupe": "#b38b6d",
  "lime_green": "#b2d732",
  "blizzard_blue": "#b0f2f7",
  "dark_copper": "#b87333",
  "water_persimmon": "#b56c60",
  "university_of_california_gold": "#b27e18",
  "deer": "#ba8759",
  "bronze_metallic": "#b08d57",
  "pale_violet": "#b391ff",
  "beau_blue": "#bcd4e6",
  "diamond": "#b9f2ff",
  "tomato_sauce": "#b41301",
  "darkgoldenrod": "#b8860b",
  "limerick": "#9dc209",
  "pale_cornflower_blue": "#b4ddfa",
  "african_violet": "#b574c3",
  "chinese_yellow_tea": "#b7702d",
  "alloy_orange": "#b65500",
  "bitter_lemon": "#b6d401",
  "powderblue": "#b0e0e6",
  "birch_brown_kabacha": "#b14a30",
  "columbia_blue": "#b8dade",
  "pale_taupe": "#bc987e",
  "pale_oak": "#bba46d",
  "silver": "#c0c0c0",
  "red_cola": "#b62020",
  "golden_oak": "#bb8141",
  "camel": "#c19a6b",
  "strawberry_red": "#c83f49",
  "light_golden_brown": "#c66b27",
  "white_tea": "#c48e69",
  "dark_pastel_red": "#bc2a16",
  "asda_orange_1968": "#bc6f00",
  "mocha": "#bea493",
  "silver_pink": "#c4aead",
  "jet_stream": "#bbd0c9",
  "bright_lavender": "#bd90e6",
  "inside_of_a_bottle": "#c6c2b6",
  "mediumvioletred": "#be0576",
  "rich_lilac": "#b666d2",
  "gin": "#bedc9d",
  "pure_crimson": "#bf1a1a",
  "lemon_iced_tea": "#bd3000",
  "greyed_red": "#bc2d29",
  "caramel": "#bf8302",
  "maple_syrup": "#bb9351",
  "pale_silver": "#c9c0bb",
  "aluminum_foil": "#bfccd2",
  "medium_spring_bud": "#c9dc87",
  "mulberry_orange": "#c0711f",
  "underside_of_willow_leaves": "#bcb58c",
  "cattail_color": "#b64925",
  "dark_ochre": "#be7f51",
  "dark_international_orange": "#c0362c",
  "mahogany": "#c04000",
  "copper_red": "#cb6d51",
  "pear": "#c2dd1f",
  "very_pale_cyan": "#ccffff",
  "venetian_red": "#c80815",
  "ruddy_brown": "#bb6528",
  "lightgray": "#cccccc",
  "very_pale_green": "#ccffcc",
  "light_french_beige": "#c8ad7f",
  "silver_sand": "#bfc1c2",
  "antique_brass": "#cd9575",
  "light_periwinkle": "#c5cbe1",
  "electric_brown": "#c67260",
  "mustard_brown": "#cd7a00",
  "brown_yellow": "#cc9966",
  "chinese_green": "#c6d856",
  "water": "#c6e4f7",
  "bright_orchid": "#c71fff",
  "lavender_gray": "#c4c3d0",
  "persian_red": "#cc3333",
  "pastel_gray": "#cfcfc4",
  "amaranth_red": "#ca1837",
  "madder_lake": "#ca2c31",
  "palelavender": "#cabeff",
  "amber_japan": "#ca6924",
  "raw_sienna": "#d68a59",
  "medium_red_violet": "#cc26a1",
  "scarlet1": "#cf3a24",
  "ochre1": "#cc7722",
  "azureish_white": "#dbe9f4",
  "very_light_green": "#ccff99",
  "carrot": "#cc3300",
  "tan": "#d2b48c",
  "peru": "#ce843a",
  "tan_crayola": "#d99a6c",
  "medium_lavender_magenta": "#ce93d8",
  "crimson": "#dc143c",
  "cedar_chest": "#c95a49",
  "cinnamon": "#d2691e",
  "tropical_violet": "#cfb0ea",
  "sinopia": "#cb410b",
  "copper": "#da8a67",
  "languid_lavender": "#d6cadd",
  "glazed_persimmon": "#d34e36",
  "dark_coral": "#d1593f",
  "decaying_leaves": "#d57835",
  "chinese_gold": "#cc9900",
  "palevioletred": "#db7093",
  "chinese_bronze": "#d28333",
  "white_oak": "#ce9f6f",
  "jolly_red": "#cc0000",
  "jasper": "#d73b3e",
  "berry_pink": "#c3447a",
  "medium_vermilion": "#d9603b",
  "orange_brown": "#d36600",
  "jelly_bean": "#da614e",
  "verizon_red1": "#cd040b",
  "fire_engine_red": "#ce2029",
  "vivid_red_tangelo": "#d55113",
  "metallic_orange": "#d55e00",
  "patrinia_flowers": "#d9b611",
  "timberwolf": "#d5ccc2",
  "lemon_lime": "#e3ff00",
  "persian_orange": "#d99058",
  "gold_brown_yamabukicha": "#cb7e1f",
  "golden_fallen_leaves": "#e29c45",
  "tumbleweed": "#deaa88",
  "blush": "#d65076",
  "deep_cerise": "#da3287",
  "rust_red": "#dd4124",
  "flame": "#e25822",
  "orchid": "#d853c9",
  "sand": "#d89852",
  "japanese_triandra_grass": "#e2b13c",
  "harvest_gold": "#da9100",
  "pale_lavender": "#dcd0ff",
  "rosso_corsa": "#d40000",
  "brewed_mustard_brown": "#e68364",
  "burlywood": "#deb887",
  "dark_vanilla": "#d9baa5",
  "beige_grey": "#dfcfbe",
  "gainsboro": "#dcdcdc",
  "nyanza": "#e9ffdb",
  "strong_carmine": "#da0a23",
  "cg_red": "#e03c31",
  "sumac_dyed_hajizome": "#e08a1e",
  "jasper_orange": "#de8f4e",
  "bone": "#e3dac9",
  "orangered": "#dc3023",
  "spanish_orange": "#e86100",
  "urobilin": "#dba010",
  "microsoft_red": "#dd2c00",
  "tigers_eye": "#e08d3c",
  "eggshell_paper": "#e2be9f",
  "persimmon": "#ec5800",
  "washed_out_persimmon": "#ec8254",
  "fawn": "#e5aa70",
  "zinnwaldite": "#ebc2af",
  "middle_purple": "#df86ac",
  "indigo_white": "#ebf6f7",
  "permanent_geranium_lake": "#e12c2c",
  "cinnabar": "#e34234",
  "candy_pink": "#e4717a",
  "salmon_rose": "#e7968b",
  "manila": "#e7c9a9",
  "platinum": "#e5e4e2",
  "green_yellow_crayola": "#f0e891",
  "bubbles": "#e7feff",
  "carrot_orange": "#ed9121",
  "bright_gray": "#e1e7ea",
  "lychee": "#dc5349",
  "beer": "#e27406",
  "gamboge": "#e49b0f",
  "lavender_mist": "#e2defa",
  "very_pale_grey": "#e1ede9",
  "google_chrome_red": "#e34b44",
  "cadmium_orange": "#ed872d",
  "cookies_and_cream": "#eee0b1",
  "palegoldenrod": "#eee8aa",
  "pale_spring_bud": "#e3e0aa",
  "chinese_white": "#e2e5de",
  "halloween_orange": "#eb6123",
  "fulvous": "#e48400",
  "gold_crayola": "#e6be8a",
  "white_coffee": "#e6e0d4",
  "mindaro": "#e3f988",
  "lust": "#e62020",
  "marigold": "#eaa221",
  "deep_raspberry": "#e6194b",
  "orioles_orange": "#fb4f14",
  "raspberry_pink": "#e6508f",
  "sawtooth_oak": "#ec956c",
  "orange_soda1": "#eb593d",
  "very_pale_yellow": "#ffffbf",
  "refreshed_red_brown": "#e35c38",
  "peach_burst": "#f39998",
  "rape_blossom_brown": "#e8a631",
  "mustard_yellow": "#e8ad00",
  "durian_white": "#e6d0ab",
  "italian_ice": "#e9f6ef",
  "aliceblue": "#e8f6ff",
  "ochre": "#ff4e20",
  "barbie_pink": "#e94196",
  "calamansi": "#fcffa4",
  "congo_pink": "#f88379",
  "deep_carrot_orange": "#e9692c",
  "burnt_sienna": "#e97451",
  "light_magenta": "#ff80ff",
  "indian_yellow": "#eaab57",
  "goldenrod": "#efc050",
  "earth_yellow": "#e1a95f",
  "blood_red": "#f35336",
  "pale_red": "#ef476f",
  "vibrant_orangered": "#f46036",
  "vivid_tangelo": "#f07427",
  "persian_pink": "#f77fbe",
  "ibis_wing_color": "#f58f84",
  "chinese_orange": "#f37042",
  "sandybrown": "#f4a460",
  "spanish_yellow": "#eda600",
  "douban_light_yellow": "#f7c58e",
  "yellow_munsell": "#efcc00",
  "white_chocolate": "#ede6d6",
  "carmine_pink": "#eb4c42",
  "fire_opal": "#ee5b4a",
  "bubblegum": "#ee8cff",
  "orange_yellow": "#f5bd1f",
  "light_red_violet": "#ff6699",
  "thrice_dyed_crimson": "#f7665a",
  "purple_pizzazz": "#fe4eda",
  "orchid_pink": "#ef87b2",
  "plum_dyed_umezome": "#fa9258",
  "dark_tangerine": "#ffa812",
  "middle_yellow_red": "#ecb176",
  "apricot": "#fbceb1",
  "isabelline": "#f4f0ec",
  "whitesmoke": "#f5f5f5",
  "primary_red": "#ff0000",
  "orange_ryb": "#fb9902",
  "mellow_apricot": "#f8b878",
  "lemon_meringue": "#f6eabe",
  "anti_flash_white": "#f0f4f5",
  "university_of_tennessee_orange": "#f77f00",
  "kumquat": "#fb9912",
  "corn_japan": "#faa945",
  "maximum_yellow_red": "#f2ba49",
  "penguin_white": "#f5f3ef",
  "american_yellow": "#f2b400",
  "turmeric": "#f2ab47",
  "light_yellow_asagi": "#f7bb7d",
  "maize_crayola": "#f2c649",
  "pastel_orange": "#ffb347",
  "jasmine": "#f8de7e",
  "pale_purple_pantone": "#fae6fa",
  "ogre_odor": "#fd5240",
  "princeton_orange": "#f58025",
  "egg": "#ffa631",
  "floral_leaf": "#ffb94e",
  "chickadee": "#ffc34d",
  "deep_champagne": "#fad6a5",
  "wheat": "#f5deb3",
  "rajah": "#fbab60",
  "gamboge_bright": "#ffb61e",
  "lightpink": "#ffb6c1",
  "topaz": "#ffc87c",
  "champagne_pink": "#f5e1d1",
  "champagne": "#f7e7ce",
  "alabaster": "#f5f3e7",
  "ghostwhite": "#f8f8ff",
  "frostbite": "#f63bbe",
  "pale_magenta_pink": "#ff99cc",
  "deep_saffron": "#ff9933",
  "deep_peach": "#ffcba4",
  "deep_lemon": "#f5c71a",
  "mintcream": "#f5fffa",
  "vivid_red": "#f70d1a",
  "huawei_red": "#f72e26",
  "pale_magenta": "#f772db",
  "safety_orange": "#ff7800",
  "light_orange": "#ffcc66",
  "bright_yellow": "#fccc1a",
  "caramel_creme": "#ffd59a",
  "mustard": "#ffdb58",
  "flavescent": "#f7e98e",
  "strong_boy_pink": "#f84ab2",
  "rinsed_out_red": "#ff7952",
  "sandy_tan": "#fdd9b5",
  "peach_yellow": "#fadfad",
  "red_ryb": "#fe2712",
  "shocking_pink_crayola": "#ff6fff",
  "sunset_yellow": "#ffc922",
  "pale_blush_pink": "#ffd1dc",
  "peach_puff": "#ffdac1",
  "jonquil": "#f4ca16",
  "bisque": "#ffe4c4",
  "flesh": "#ffe9d1",
  "white": "#ffffff",
  "outrageous_orange": "#ff6e4a",
  "atomic_tangerine": "#ff9966",
  "yellow_orange_wheel": "#ff9505",
  "chrome_yellow": "#ffa700",
  "yellow_orange": "#ffae42",
  "mikado_yellow": "#ffc40c",
  "orange_yellow_crayola": "#f8d568",
  "sunshine_yellow": "#ffe119",
  "very_pale_orange": "#ffdfbf",
  "moccasin": "#ffe4b5",
  "lumber": "#ffe4cd",
  "naples_yellow": "#fada5e",
  "banana_mania": "#fae9ae",
  "blanchedalmond": "#ffebcd",
  "coral_red": "#fb3028",
  "brave_orange": "#ff631c",
  "darkorange": "#ff8c00",
  "cape_jasmine": "#ffb95a",
  "mango": "#fdbe02",
  "sunglow": "#ffcc33",
  "shandy": "#ffe670",
  "seashell": "#fff5ee",
  "medium_champagne": "#fbf0b4",
  "lotion": "#fefdfa",
  "coral": "#ff7f50",
  "red_bronze": "#fb8136",
  "satsuma": "#f28500",
  "microsoft_yellow": "#fdb900",
  "bright_yellow_orange": "#ffbe0b",
  "ripe_mango": "#ffc324",
  "spanish_pink": "#fcc4bf",
  "feldspar": "#fdd5b1",
  "dandelion_crayola": "#fddb6d",
  "electric_yellow": "#fee440",
  "lavenderblush": "#fff0f5",
  "ivory": "#fffff0",
  "baby_powder": "#fefefa",
  "pastel_red": "#ff6961",
  "orange_red": "#ff681f",
  "smashed_pumpkin": "#ff6d3a",
  "tulip": "#ff878d",
  "mango_tango": "#ff8243",
  "royal_orange": "#f99245",
  "light_hot_pink": "#ffb3de",
  "vibrant_bright_yellow": "#ffd32d",
  "cherry_blossom": "#fcc9b9",
  "child_banana": "#fddb3a",
  "fashion_fuchsia": "#fe05a2",
  "bright_orange_red": "#fb5607",
  "dark_salmon": "#ff6666",
  "tangerine": "#fc600a",
  "sunset_orange": "#fd5e53",
  "american_orange": "#ff8b00",
  "meat_color": "#fe8e6e",
  "vivid_gamboge": "#ff9900",
  "washed_out_crimson": "#ffb3a7",
  "bright_yellow_crayola": "#ffaa1d",
  "light_blush": "#fea8a7",
  "ucla_gold": "#ffb300",
  "selective_yellow": "#ffba00",
  "amber": "#ffbf00",
  "vibrant_sunny_yellow": "#ffd166",
  "peach": "#ffd8b1",
  "peachpuff": "#ffdab9",
  "pale_peach": "#ffe5b4",
  "papayawhip": "#ffefd5",
  "blond": "#fef3c0",
  "yellow_crayola": "#fce883",
  "cornsilk": "#fff8dc",
  "cosmic_latte": "#fff8e7",
  "milk": "#fdfff5",
  "hot_pink": "#ff0066",
  "shocking_pink": "#fc0fc0",
  "candy_apple_red": "#ff0800",
  "barbie_pink_1999": "#ff2d8a",
  "taobao_orange": "#ff4200",
  "rose_bonbon": "#ff4081",
  "portland_orange": "#ff4c2a",
  "strawberry": "#ff5050",
  "vivid_orange": "#ff5f00",
  "hotpink": "#ff61a9",
  "pumpkin": "#ff7518",
  "watermelon": "#ff6f61",
  "begonia": "#ff6c75",
  "philippine_orange": "#ff7300",
  "papaya": "#ff732d",
  "coral_color": "#ff7759",
  "salmon": "#ff7b78",
  "soft_coral": "#ff9aa2",
  "vivid_tangerine": "#ff9d83",
  "vivid_orange_peel": "#ffa000",
  "pale_incense_usuko": "#ffa565",
  "ora_orange": "#ffa500",
  "vibrant_orange": "#ff9f1c",
  "poppy_petal": "#ffa996",
  "very_light_tangelo": "#ffb077",
  "chinese_yellow": "#ffb200",
  "macaroni_and_cheese": "#ffbd88",
  "golden_poppy": "#fcc200",
  "melon": "#febaad",
  "philippine_yellow": "#fecb00",
  "tangerine_yellow": "#ffcc00",
  "classic_rose": "#ffcce1",
  "google_chrome_yellow": "#ffce44",
  "pale_pink": "#ffcccc",
  "banana": "#ffd662",
  "unbleached_silk": "#ffddca",
  "golden": "#ffd700",
  "golden_yellow": "#ffdf00",
  "banana_yellow": "#ffe02e",
  "navajowhite": "#ffdead",
  "minion_yellow": "#ffe959",
  "middle_yellow": "#ffeb00",
  "corn": "#ffea5c",
  "antiquewhite": "#ffead9",
  "vibrant_electric_yellow": "#ffeb3b",
  "buttercup_yellow": "#fff620",
  "lemon_yellow_crayola": "#ffff9f",
  "oldlace": "#fff7eb",
  "pastel_yellow": "#fff891",
  "snow": "#fffafa",
  "navy": "#000066",
  "deep_blue": "#000075",
  "darkblue": "#00008b",
  "dark_blue": "#000099",
  "duke_blue": "#00009c",
  "medium_blue": "#0000cc",
  "mediumblue": "#0000cd",
  "primary_blue": "#0000ff",
  "primary_green": "#00ff00",
  "primary_yellow": "#ffff00",
  "phthalo_blue": "#000f89",
  "cetacean_blue": "#001440",
  "zaffre": "#0014a8",
  "blue_pantone": "#0018a8",
  "resolution_blue": "#002387",
  "air_force_blue_usaf": "#00308f",
  "dark_green": "#003300",
  "dark_midnight_blue": "#003366",
  "ua_blue": "#0033aa",
  "bright_blue": "#0033cc",
  "philippine_blue": "#0038a7",
  "royal_azure": "#0038a8",
  "ateneo_blue": "#003a6c",
  "tardis_blue": "#003b6f",
  "rich_black": "#004040",
  "dark_imperial_blue_green": "#00416a",
  "british_racing_green": "#004225",
  "warm_black": "#004242",
  "dark_cyan": "#004346",
  "midnight_green": "#004953",
  "deep_jungle_green": "#004b49",
  "castleton_green": "#00563f",
  "deep_cyan": "#005f73",
  "dark_green_x11": "#006400",
  "green_bamboo": "#006442",
  "pakistan_green": "#006600",
  "sea_bluegreen": "#006699",
  "brilliant_blue": "#0066ff",
  "bangladesh_green": "#006a4e",
  "cadmium_green": "#006b3c",
  "new_bridge": "#006c7f",
  "honolulu_blue": "#006db0",
  "spanish_blue": "#0070b8",
  "brandeis_blue": "#0070ff",
  "skobeloff": "#007474",
  "tropical_rain_forest": "#00755e",
  "microsoft_edge_blue": "#0078d7",
  "cg_blue": "#007aa5",
  "celadon_blue": "#007ba7",
  "star_command_blue": "#007bb8",
  "ao_english": "#008000",
  "teal": "#008080",
  "blue_ncs": "#0087bd",
  "darkcyan": "#008b8b",
  "islamic_green": "#009000",
  "spanish_green": "#009150",
  "bondi_blue": "#0095b6",
  "viridian_green": "#009698",
  "strong_green": "#009900",
  "green_cyan": "#009966",
  "deep_sky_blue": "#0099cc",
  "seaglass": "#009b77",
  "shamrock_green": "#009e60",
  "green_ncs": "#009f6b",
  "green_pigment": "#00a550",
  "jade": "#00a86b",
  "sesame_street_green": "#00a870",
  "vivid_cerulean": "#00aaee",
  "go_green": "#00ab66",
  "blue_bolt": "#00b9fb",
  "bright_sky_blue": "#00bbf9",
  "capri": "#00bfff",
  "vivid_malachite": "#00cc33",
  "medium_spring_green": "#00cc66",
  "robin_egg_blue": "#00cccc",
  "darkturquoise": "#00ced1",
  "asda_green_1985": "#00dea4",
  "mediumspringgreen": "#00fa9a",
  "guppie_green": "#00ff7f",
  "spring_green": "#00ff99",
  "aquagreen": "#00ffcc",
  "sea_green_crayola": "#00ffcd",
  "turquoise_blue": "#00ffef",
  "emerald": "#013220",
  "forest_green_traditional": "#014421",
  "dark_navy": "#02075d",
  "dark_pastel_green": "#03c03c",
  "sacramento_state_green": "#043927",
  "emerald_green": "#046307",
  "deep_green": "#056608",
  "dark_teal": "#073b4c",
  "dark_cyan_blue": "#08415c",
  "bright_turquoise": "#08e8de",
  "indigo_dye": "#091f92",
  "cadmium_blue": "#0a1195",
  "blue_black": "#0b132b",
  "malachite": "#0bda51",
  "deep_green_cyan": "#0e7c61",
  "sapphire": "#0f52ba",
  "midnight_purple": "#10002b",
  "eerie_black": "#101820",
  "vibrant_blue": "#118ab2",
  "samsung_blue": "#12279e",
  "phthalo_green": "#123524",
  "blue_sapphire": "#126180",
  "royal_green": "#136207",
  "india_green": "#138808",
  "lotion_blue": "#15f2fd",
  "fluorescent_blue": "#15f4ee",
  "elderberry": "#17182b",
  "dark_spring_green": "#177245",
  "coarse_wool": "#181b26",
  "msu_green": "#18453b",
  "verse_green": "#18880d",
  "midnightblue": "#191970",
  "dark_blue_kon": "#192236",
  "raisin_black": "#1a1423",
  "dark_jungle_green": "#1a2421",
  "google_chrome_green": "#1aa260",
  "caribbean_blue": "#1ac1dd",
  "black_chocolate": "#1b1811",
  "prussian_blue": "#1b263b",
  "dark_blue_lapis_lazuli": "#1b294b",
  "brunswick_green": "#1b4d3e",
  "bluebonnet": "#1c1cf0",
  "medium_jungle_green": "#1c352d",
  "persian_blue": "#1c39bb",
  "pacific_blue": "#1ca9c9",
  "green_crayola": "#1cac78",
  "space_cadet": "#1d2951",
  "light_blue_flower": "#1d697c",
  "pomona_green": "#1e4d2b",
  "dark_gunmetal": "#1f262a",
  "ball_blue": "#21abcd",
  "velvet_birodo": "#224634",
  "forestgreen": "#228b22",
  "blackcurrant": "#230c33",
  "dark_red_kurobeni": "#23191e",
  "indigo_rainbow": "#233067",
  "very_dark_violet": "#240046",
  "douban_blue": "#2496cd",
  "black_leather_jacket": "#253529",
  "japanese_indigo": "#264348",
  "winter_blue": "#26547c",
  "palatinate_blue": "#273be2",
  "dark_olive": "#283618",
  "cyan_cobalt_blue": "#28589c",
  "root_beer": "#290e05",
  "slimy_green": "#299617",
  "jungle_cyan": "#29ab87",
  "cerulean_blue": "#2a52be",
  "green_midori": "#2a603b",
  "gun_grey": "#2b2d42",
  "iron_tetsu": "#2b3733",
  "iron_storage": "#2b3736",
  "insect_screen": "#2d4436",
  "cosmic_cobalt": "#2e2d88",
  "indigo_codium": "#2e372e",
  "yinmn_blue": "#2e5090",
  "bdazzled_blue": "#2e5894",
  "seagreen": "#2e8b57",
  "douban_green": "#2e963d",
  "vibrant_turquoise": "#2ec4b6",
  "darkslategray": "#2f4f4f",
  "darkpurple": "#301934",
  "yellow_green": "#30b21a",
  "mountain_meadow": "#30ba8f",
  "maximum_blue_green": "#30bfbf",
  "myrtle_green": "#317873",
  "persian_indigo": "#32127a",
  "russian_violet": "#32174d",
  "metallic_blue": "#32527b",
  "limegreen": "#32cd32",
  "very_dark_olive": "#333300",
  "deep_koamaru": "#333366",
  "indigo_sky": "#3333cc",
  "electric_blue": "#3333ff",
  "young_olive": "#336600",
  "dark_slate_blue": "#336699",
  "royal_blue": "#3366cc",
  "sea_green": "#339966",
  "light_green": "#33cc33",
  "sea_sky": "#33cccc",
  "steel_blue": "#347c98",
  "wageningen_green": "#34b233",
  "black_kite": "#351e1c",
  "kombu_green": "#354230",
  "deep_moss_green": "#355e3b",
  "poker_green": "#35654d",
  "chinese_blue": "#365194",
  "thousand_year_old_green": "#374231",
  "vine_green": "#38a32a",
  "pixie_powder": "#391285",
  "deeppurple": "#3a243b",
  "blue_green_seiheki": "#3a6960",
  "vivid_blue": "#3a86ff",
  "pullman_green": "#3b331c",
  "thousand_year_old_brown": "#3b3429",
  "american_blue": "#3b3b6d",
  "amazon": "#3b7a57",
  "dark_sienna": "#3c1414",
  "deep_indigo": "#3c1874",
  "dark_olive_drab": "#3c341f",
  "ufo_green": "#3cd070",
  "black_bean": "#3d0c02",
  "jacarta": "#3d325d",
  "storeroom_brown": "#3d4035",
  "mint": "#3eb489",
  "electric_ultramarine": "#3f00ff",
  "dark_lavender": "#3f3351",
  "harlequin": "#3fff00",
  "patina_rokusho": "#407a52",
  "deep_aquamarine": "#40826d",
  "jacko_bean": "#413628",
  "dark_taupe": "#423629",
  "cobalt_blue": "#4363d8",
  "queen_blue": "#436b95",
  "rifle_green": "#444c38",
  "eucalyptus": "#44d7a8",
  "burgundy_velvet": "#450920",
  "medium_turquoise": "#45b8ac",
  "aubergine": "#462255",
  "gray_asparagus": "#465945",
  "steelblue": "#4682b4",
  "cyan_blue_azure": "#4682bf",
  "light_teal": "#469990",
  "harlequin_green": "#46cb18",
  "flirtatious_indigo_tea": "#473f2d",
  "bulgarian_rose": "#480607",
  "darkslateblue": "#483d8b",
  "light_emerald": "#48bf84",
  "ocean_green": "#48bf91",
  "mediumturquoise": "#48d1cc",
  "dark_chocolate": "#490206",
  "rabbit_ear_iris": "#491e3c",
  "hookers_green": "#49796b",
  "brown_coffee": "#4a2c2a",
  "independence2": "#4a4e69",
  "dark_moss_green": "#4a5d23",
  "chlorophyll_green": "#4aff00",
  "indigo": "#4b0082",
  "spanish_violet": "#4c2882",
  "independence": "#4c516d",
  "kelly_green": "#4cbb17",
  "blue_violet_color_wheel": "#4d1a7f",
  "wisteria_and_burnt_bamboo": "#4d3b3c",
  "sooty_willow_bamboo": "#4d4b3a",
  "feldgrau": "#4d5d53",
  "middle_green": "#4d8c57",
  "french_puce": "#4e1609",
  "purple_navy": "#4e5180",
  "cyan_azure": "#4e82b4",
  "purple_murasaki": "#4f284b",
  "ocean_blue": "#4f42b5",
  "fern_green": "#4f7942",
  "blueberry": "#4f86f7",
  "purple_taupe": "#50404d",
  "blue_yonder": "#5072a7",
  "ksu_purple": "#512888",
  "dark_bronze_coin": "#514100",
  "regalia": "#522d80",
  "codium_fragile_seaweed": "#524b2a",
  "blue_black_crayfish": "#52593b",
  "rikan_brown_rikancha": "#534a32",
  "ucla_blue": "#536895",
  "dark_maroon": "#540b0e",
  "soldier_green": "#545a2c",
  "liberty": "#545aa7",
  "american_violet": "#551b8c",
  "blue_magenta_violet": "#553592",
  "ebony": "#555d50",
  "pineapple": "#563c0d",
  "avocado": "#568203",
  "wintergreen_dream": "#56887d",
  "airforce_greyblue": "#577590",
  "cyber_grape": "#58427c",
  "seal_brown": "#59260b",
  "caput_mortuum": "#592720",
  "mulberry_dye": "#59292c",
  "safflower": "#5a4f74",
  "iris": "#5a4fcf",
  "aloeswood_brown": "#5a6457",
  "metallic_violet": "#5b0a91",
  "japanese_violet": "#5b3256",
  "blue_lavender": "#5b5ea6",
  "united_nations_blue": "#5b92e5",
  "nightingale_brown": "#5c4827",
  "mousy_indigo": "#5c544e",
  "lemon_lime_blue": "#5cff67",
  "philippine_brown": "#5d1916",
  "dark_byzantium": "#5d3954",
  "earthtone": "#5d3a1a",
  "bellflower": "#5d3f6a",
  "silver_lake_blue": "#5d89ba",
  "storm_blue": "#5d8cae",
  "polished_pine": "#5da493",
  "maroon": "#5e2824",
  "iwai_brown_iwaicha": "#5e5545",
  "old_bamboo": "#5e644f",
  "forest_green_crayola": "#5fa777",
  "shiny_shamrock": "#5fa778",
  "chestnut_leather_brown": "#60281e",
  "majorelle_blue": "#6050dc",
  "glaucous": "#6082b6",
  "eggplant": "#614051",
  "blood_organ": "#630f0f",
  "italian_leather": "#635a52",
  "axolotl": "#63775b",
  "pullman_brown_ups_brown": "#644117",
  "cornflowerblue": "#6495ed",
  "claret_red": "#650d1b",
  "greyish_dark_green": "#656255",
  "green_slime": "#65ff00",
  "blood_red1": "#660000",
  "dark_red": "#660033",
  "deep_purple": "#6600cc",
  "vivid_violet": "#6600ff",
  "imperial_purple": "#66023c",
  "spanish_purple": "#66033c",
  "deepviolet": "#6622cc",
  "darkbrown": "#663300",
  "rebeccapurple": "#663399",
  "halaya_pink": "#663854",
  "dark_olive_green": "#666633",
  "dark_lavenderblue": "#666699",
  "blue_gray": "#6699cc",
  "asda_green_1999": "#66c992",
  "bright_green": "#66ff00",
  "spring_leaf": "#66ff33",
  "screamin_green": "#66ff66",
  "spearmint": "#66ff99",
  "light_aqua": "#66ffcc",
  "bleach": "#66ffff",
  "red_bean_color": "#672422",
  "violin_brown": "#674403",
  "rose_ebony": "#674846",
  "russian_green": "#679267",
  "red_oxide": "#6a040f",
  "bright_purple": "#6a0dad",
  "rusted_light_blue": "#6a7f7a",
  "brown_nose": "#6b4423",
  "blue_purple": "#6b5b95",
  "young_bamboo": "#6b9362",
  "eminence": "#6c3082",
  "field_drab": "#6c541e",
  "little_boy_blue": "#6ca0dc",
  "vine_grape_ebizome": "#6d2b50",
  "cerulean_frost": "#6d9bc3",
  "plain_mouse": "#6e5f57",
  "green_sheen": "#6eaea1",
  "electric_indigo": "#6f00ff",
  "grape": "#6f2da8",
  "cypress_bark_red": "#6f3028",
  "coffee": "#6f4e37",
  "persian_plum": "#701c1c",
  "midnight": "#702670",
  "byzantium": "#702963",
  "sepia": "#704214",
  "mud": "#70543e",
  "rum": "#716675",
  "iceberg": "#71a6d2",
  "air_superiority_blue": "#72a0c1",
  "garnet": "#733635",
  "dark_lilac": "#734f96",
  "blue_violet_crayola": "#7366bd",
  "bronze_yellow": "#737000",
  "smoke": "#738276",
  "xanadu": "#738678",
  "toolbox": "#746cc0",
  "pale_green_onion": "#749f8d",
  "very_light_azure": "#74bbfb",
  "harbor_rat": "#757d75",
  "iris_purple": "#763568",
  "mousy_wisteria": "#766980",
  "pale_purple": "#774d8e",
  "rhythm": "#777696",
  "shadow_blue": "#778ba5",
  "periwinkle": "#779ecb",
  "pansy_purple": "#78184a",
  "royal_purple": "#7851a9",
  "stained_red": "#78779b",
  "camouflage_green": "#78866b",
  "old_lavender": "#796878",
  "up_maroon": "#7b1113",
  "deep_scarlet": "#7b3b3a",
  "bud_green": "#7bb661",
  "vista_blue": "#7c9ed9",
  "lawngreen": "#7cfc00",
  "middle_blue": "#7ed4e6",
  "violet_color_wheel": "#7f00ff",
  "cadmium_violet": "#7f3e98",
  "japanese_iris": "#7f5d3b",
  "chartreuse": "#7fff00",
  "aquamarine": "#7fffd4",
  "red_maroon": "#800000",
  "patriarch": "#800080",
  "american_brown": "#804040",
  "dark_bronze": "#804a00",
  "spanish_bistre": "#807532",
  "asda_green_1994": "#80c197",
  "philippine_violet": "#81007f",
  "coyote_brown": "#81613c",
  "celadon_seiji": "#819c8b",
  "deep_maroon": "#820000",
  "raw_umber": "#826644",
  "dolphin_gray": "#828e84",
  "smokey_topaz": "#832a0d",
  "vibrant_purple": "#8338ec",
  "violets_are_blue": "#8366f4",
  "brass_yellow": "#83781b",
  "ou_crimson_red": "#841617",
  "deep_red": "#850101",
  "chinese_violet": "#856088",
  "french_bistre": "#856d4d",
  "gold_fusion": "#85754e",
  "baiko_brown": "#857c55",
  "dollar_bill": "#85bb65",
  "violet_ryb": "#8601af",
  "french_lilac": "#86608e",
  "aqua_blue": "#86aba5",
  "dark_raspberry": "#872657",
  "boysenberry": "#873260",
  "brandy": "#87413f",
  "skyblue": "#87ceeb",
  "spring_frost": "#87ff2a",
  "french_violet": "#8806ce",
  "bronze1": "#88540b",
  "ube": "#8878c3",
  "wisteria_fuji": "#89729e",
  "rusty_celadon": "#898a74",
  "blueviolet": "#8a2be2",
  "burnt_umber": "#8a3324",
  "twilight_lavender": "#8a496b",
  "darkred": "#8b0000",
  "darkmagenta": "#8b008b",
  "strawberry_jam": "#8b171a",
  "middle_blue_purple": "#8b72be",
  "moss_color": "#8b7d3a",
  "cool_grey": "#8c92ac",
  "willow_dye": "#8c9e5e",
  "razzmic_berry": "#8d4e85",
  "half_hashita": "#8d608c",
  "deep_apple_green": "#8db600",
  "electric_violet": "#8f00ff",
  "true_red": "#8f1d21",
  "artichoke": "#8f9779",
  "darkseagreen": "#8fbc8f",
  "light_olive_green": "#90be6d",
  "lightgreen": "#90ee90",
  "dyestalk_red": "#913225",
  "red_kite": "#913228",
  "sugar_plum": "#914e75",
  "antique_fuchsia": "#915c83",
  "dark_tan": "#918151",
  "iced_tea": "#923c01",
  "rain_blue": "#92a8d1",
  "smoky_topaz": "#933d41",
  "persimmon_juice_color": "#934337",
  "porcupine": "#936900",
  "mediumpurple": "#9370db",
  "darkviolet": "#9400d3",
  "lavender_indigo": "#9457eb",
  "chestnut": "#954535",
  "rosewood": "#955251",
  "violet_crayola": "#963d7f",
  "purple_mountain_majesty": "#9678b6",
  "eton_blue": "#96c8a2",
  "pale_robin_egg_blue": "#96ded1",
  "mango_green": "#96ff00",
  "tatarian_aster": "#976e9a",
  "silver_grey_ginnezumi": "#97867c",
  "manatee": "#979aaa",
  "fox": "#985629",
  "pale_brown": "#987654",
  "palegreen": "#98fb98",
  "mint_green": "#98ff98",
  "crimson_red": "#990000",
  "dark_red_violet": "#990099",
  "dark_violet": "#9900cc",
  "bright_violet": "#9900ff",
  "brown": "#993300",
  "indian_red": "#993333",
  "dark_mauve": "#993366",
  "electric_lilac": "#9933ff",
  "deep_lilac": "#9955bb",
  "golden_brown": "#996515",
  "copper_rose": "#996666",
  "mountbatten_pink": "#997a8d",
  "pale_olive": "#999966",
  "lime": "#99cc00",
  "light_chartreuse": "#99ff33",
  "light_lime": "#99ff66",
  "pale_green": "#99ff99",
  "pale_mint": "#99ffcc",
  "carmine": "#9b2335",
  "faded_spicy_red_brown": "#9b533f",
  "dark_yellow": "#9b870c",
  "willow_tea": "#9c8a4d",
  "deep_amethyst": "#9c8aa4",
  "french_lime": "#9efd38",
  "blue_lilac": "#9f00ff",
  "magenta_haze": "#9f4576",
  "sea_foam_green": "#9fe2bf",
  "purple_x11": "#a020f0",
  "sienna": "#a0522d",
  "stone_terrace": "#a09484",
  "winter_wizard": "#a0e6ff",
  "burnished_brown": "#a17a74",
  "baby_blue_eyes": "#a1caf1",
  "flirt": "#a2006d",
  "child_purple": "#a23bec",
  "sappanwood_incense": "#a24f46",
  "blue_bell": "#a2a2d0",
  "wild_blue": "#a2add0",
  "redwood": "#a45a52",
  "sage_green": "#a4b086",
  "waterspout": "#a4f4f9",
  "middle_red_purple": "#a55353",
  "gold": "#a57c00",
  "whitish_green": "#a5ba93",
  "metallic_red": "#a62c2b",
  "maximum_red_purple": "#a63a79",
  "vivid_lime_green": "#a6d608",
  "rambutan_red": "#a72127",
  "rich_lavender": "#a76bcf",
  "green_lizard": "#a7f432",
  "spring_bud": "#a7fc00",
  "thin_usu": "#a87ca0",
  "opal": "#a8c3bc",
  "laurel_green": "#a9ba9d",
  "heliotrope_magenta": "#aa00bb",
  "heliotrope_gray": "#aa98a9",
  "magic_mint": "#aaf0d1",
  "english_red": "#ab4b52",
  "wilted_brown": "#ab4c3d",
  "rose_vale": "#ab4e52",
  "glossy_grape": "#ab92b3",
  "cherry_blossom_mouse": "#ac8181",
  "maximum_blue_purple": "#acace6",
  "middle_green_yellow": "#acbf60",
  "celadon": "#ace1af",
  "mystic_maroon": "#ad4379",
  "light_moss_green": "#addfad",
  "greenyellow": "#adff2f",
  "lilac_luster": "#ae98aa",
  "brown_crayola": "#af593e",
  "pale_blue_pale_turquoise": "#afeeee",
  "apple_green": "#afff45",
  "giants_club": "#b05c52",
  "durian": "#b07939",
  "lightsteelblue": "#b0c4de",
  "light_gold": "#b29700",
  "pastel_purple": "#b39eb5",
  "fandango": "#b53389",
  "lavender_floral": "#b57edc",
  "brass": "#b5a642",
  "olive_green": "#b5b35c",
  "child_mint": "#b5ead7",
  "pearly_purple": "#b768a2",
  "opera_mauve": "#b784a7",
  "vivid_mulberry": "#b80ce3",
  "liver_dogs": "#b86d29",
  "deep_chestnut": "#b94e48",
  "long_spring": "#b95754",
  "white_mouse": "#b9a193",
  "ue_red": "#ba0001",
  "international_orange1": "#ba160c",
  "mediumorchid": "#ba55d3",
  "red_magenta": "#bb3385",
  "misty_moss": "#bbb477",
  "rosybrown": "#bc8f8f",
  "sage": "#bcb88a",
  "rose_quartz_pink": "#bd559c",
  "gold_foil": "#bd9b16",
  "greenfinch": "#bda928",
  "darkkhaki": "#bdb76b",
  "electric_purple": "#bf00ff",
  "bittersweet_shimmer": "#bf4f51",
  "pomelo_olive": "#bfbd70",
  "vodka": "#bfc0ee",
  "bitter_lime": "#bfff00",
  "red_violet_crayola": "#c0448f",
  "old_rose": "#c08081",
  "tuscany": "#c09999",
  "menthol": "#c1f9a2",
  "ecru": "#c2b280",
  "periwinkle_crayola": "#c3cde6",
  "mulberry": "#c54b8c",
  "vegas_gold": "#c5b358",
  "lavender_blue": "#c7ceea",
  "smitten": "#c84186",
  "mulberry_crayola": "#c8509b",
  "asda_orange": "#c86500",
  "lilac": "#c8a2c8",
  "wisteria": "#c9a0dc",
  "aero_blue": "#c9ffe5",
  "magenta_dye": "#ca1f7b",
  "royal_fuchsia": "#ca2c92",
  "muddy_brown": "#cb6649",
  "pastel_violet": "#cb99c9",
  "satin_sheen_gold": "#cba135",
  "vivid_raspberry": "#cc0066",
  "strong_magenta": "#cc0099",
  "deep_magenta": "#cc00cc",
  "vivid_orchid": "#cc00ff",
  "magenta_pink": "#cc338b",
  "steel_pink": "#cc33cc",
  "english_vermillion": "#cc474b",
  "burnt_orange": "#cc5500",
  "fuzzy_wuzzy": "#cc6666",
  "medium_pink": "#cc6699",
  "medium_orchid": "#cc66ff",
  "light_grayish_magenta": "#cc99cc",
  "lemon_curry": "#cca01d",
  "electric_lime": "#ccff00",
  "light_lime_green": "#ccff33",
  "pale_yellow_green": "#ccff66",
  "tenne_tawny": "#cd5700",
  "indianred": "#cd5c5c",
  "bronze": "#cd7f32",
  "soap": "#cec8ef",
  "volt": "#ceff00",
  "super_pink": "#cf6ba9",
  "sky_magenta": "#cf71af",
  "old_gold": "#cfb53b",
  "tea_green": "#d0f0c0",
  "arctic_lime": "#d0ff14",
  "bright_ube": "#d19fe8",
  "lime_pulp": "#d1e189",
  "pale_tan": "#d2c29d",
  "barbie_pink_1975": "#d3419d",
  "light_medium_orchid": "#d39bcb",
  "american_gold": "#d3af37",
  "steamed_chestnut": "#d3b17d",
  "wild_orchid": "#d470a2",
  "deep_mauve": "#d473d4",
  "gold_metallic": "#d4af37",
  "pink_pantone": "#d74894",
  "new_york_pink": "#d7837f",
  "bright_lilac": "#d891ef",
  "pink_lavender": "#d8b2d1",
  "thistle": "#d8bfd8",
  "maximum_red": "#d92121",
  "vermilion": "#d9381e",
  "strawberry_daiquiri": "#d9463e",
  "maximum_green_yellow": "#d9e650",
  "vivid_cerise": "#da1d81",
  "sunflower_yellow": "#daa520",
  "pale_chestnut": "#ddadaf",
  "bored_accent_green": "#dde26a",
  "pastel_pink": "#dea5a4",
  "phlox": "#df00ff",
  "heliotrope": "#df73ff",
  "chartreuse_traditional": "#dfff00",
  "barbie_pink_pantone": "#e0218a",
  "mauve": "#e0b0ff",
  "lanzones": "#e0bc5b",
  "lightcyan": "#e0ffff",
  "terracotta": "#e15d44",
  "durian_yellow": "#e1bd27",
  "terra_cotta": "#e2725b",
  "orchid_crayola": "#e29cd2",
  "pale_spring": "#e2f0cb",
  "sunray": "#e3ab57",
  "nintendo_red": "#e4000f",
  "red_purple": "#e40078",
  "mexican_pink": "#e4007c",
  "citrine": "#e4d00a",
  "straw": "#e4d96f",
  "vivid_vermilion": "#e56024",
  "middle_red": "#e58e73",
  "meat_brown": "#e5b73b",
  "dust_storm": "#e5ccc9",
  "electric_red": "#e60000",
  "light_orchid": "#e6a8d7",
  "peridot": "#e6e200",
  "royal_pink": "#e73895",
  "kobi": "#e79fc4",
  "pink_pearl": "#e7accf",
  "ku_crimson": "#e8000d",
  "big_foot_feet": "#e88e5a",
  "dirty_white": "#e8e4c9",
  "key_lime": "#e8f48c",
  "darksalmon": "#e9967a",
  "arylide_yellow": "#e9d66b",
  "coconut_white": "#e9edf6",
  "pearl": "#eae0c8",
  "thistle_crayola": "#ebb0d7",
  "verizon_red": "#ec1c24",
  "lotion_pink": "#eccfcf",
  "sandstorm": "#ecd540",
  "desert_sand": "#edc9af",
  "lavender_magenta": "#ee82ee",
  "safety_yellow": "#eed202",
  "flax": "#eedc82",
  "titanium_yellow": "#eee600",
  "watermelon_yellow": "#eeff1b",
  "deep_carmine_pink": "#ef3038",
  "vivaldi_red": "#ef3939",
  "almond": "#efdecd",
  "dutch_white": "#efdfbb",
  "neon_yellow": "#efff04",
  "red_incense": "#f07f5e",
  "lightcoral": "#f08080",
  "one_kin": "#f08f90",
  "buff": "#f0dc82",
  "dandelion": "#f0e130",
  "light_khaki": "#f0e68c",
  "eggshell": "#f0ead6",
  "honeydew": "#f0fff0",
  "azure_mist": "#f0ffff",
  "vibrant_light_magenta": "#f15bb5",
  "rich_brilliant_lavender": "#f1a7fe",
  "margarine": "#f2d930",
  "very_pale_pink": "#f2e2e0",
  "sunny": "#f2f27a",
  "deep_orange": "#f3722c",
  "mandarin": "#f37a48",
  "amur_cork_tree": "#f3c13a",
  "pale_blush": "#f4b9b8",
  "brilliant_lavender": "#f4bbff",
  "baby_pink": "#f4c2c2",
  "saffron": "#f4c430",
  "rich_gardenia": "#f57f4f",
  "orange": "#f58231",
  "beige": "#f5f5dc",
  "coral_reef": "#f6a494",
  "light_pink": "#f7cac9",
  "magnolia": "#f8f4ff",
  "strong_red": "#f94144",
  "tangelo": "#f94d00",
  "light_fuchsia_pink": "#f984ef",
  "pomelo_white": "#f9ffe3",
  "philippine_pink": "#fa1a8e",
  "orange_soda": "#fa5b3d",
  "dawn_color": "#fa7b62",
  "linen": "#faf0e6",
  "maximum_yellow": "#fafa37",
  "lightgoldenrodyellow": "#fafad2",
  "flickr_pink": "#fb0081",
  "tart_orange": "#fb4d46",
  "lavender_rose": "#fba0e3",
  "pink_flamingo": "#fc74fd",
  "pale_persimmon": "#fca474",
  "icterine": "#fcf75e",
  "xiaomi_orange": "#fd4900",
  "willpower_orange": "#fd5800",
  "coral_reef1": "#fd7c6e",
  "melancholy": "#fdbcb4",
  "metallic_yellow": "#fdcc0d",
  "aureolin": "#fdee00",
  "sponge": "#fdfe03",
  "lemon_glacier": "#fdff00",
  "persian_rose": "#fe28a2",
  "giants_orange": "#fe5a1d",
  "bittersweet": "#fe6f5e",
  "peach_cream": "#fed8b1",
  "yellow_pantone": "#fedf00",
  "dodie_yellow": "#fef65b",
  "yellow_ryb": "#fefe33",
  "neon_pink": "#ff006e",
  "sunset": "#ff007c",
  "bright_pink": "#ff007f",
  "magenta_process": "#ff0090",
  "fuchsia": "#ff00ff",
  "deeppink": "#ff1493",
  "hot_magenta": "#ff1dce",
  "chili_red": "#ff2400",
  "ferrari_red": "#ff2800",
  "red_orange": "#ff3300",
  "deep_pink": "#ff3399",
  "razzle_dazzle_rose": "#ff33cc",
  "electric_orange": "#ff3503",
  "coquelicot": "#ff3800",
  "sunburnt_cyclops": "#ff404c",
  "salmon_pink": "#ff4057",
  "wild_strawberry": "#ff43a4",
  "red_orange_color_wheel": "#ff4500",
  "international_orange": "#ff4f00",
  "orange_red_brown": "#ff5349",
  "mystic_red": "#ff5500",
  "orange1": "#ff5800",
  "maximum_orange": "#ff5b00",
  "light_deep_pink": "#ff5ccd",
  "tomato": "#ff6347",
  "classic_orange": "#ff6600",
  "rose_pink": "#ff66cc",
  "magentapink": "#ff66ff",
  "safety_orange_blaze": "#ff6700",
  "fuchsia_pink": "#ff77ff",
  "heat_wave": "#ff7a00",
  "amber_saeece": "#ff7e00",
  "primary_orange": "#ff7f00",
  "princess_perfume": "#ff85cf",
  "daylily": "#ff8936",
  "light_coral": "#ff968a",
  "american_pink": "#ff9899",
  "light_salmon_pink": "#ff9999",
  "weebly_orange": "#ff9a00",
  "orange_peel": "#ff9f00",
  "lightsalmon": "#ffa07a",
  "stylish_persimmon": "#ffa26b",
  "neon_carrot": "#ffa343",
  "dark_golden_yellow": "#ffa400",
  "cheese": "#ffa600",
  "pink": "#ffc0cb",
  "peach_orange": "#ffcc99",
  "light_red": "#ffcccb",
  "rosa": "#ffccff",
  "shampoo": "#ffcff1",
  "cyber_yellow": "#ffd300",
  "school_bus_yellow": "#ffd800",
  "sizzling_sunrise": "#ffdb00",
  "sprint_yellow": "#ffdd05",
  "pink_lace": "#ffddf4",
  "gargoyle_gas": "#ffdf46",
  "vivid_yellow": "#ffe302",
  "mistyrose": "#ffe4e1",
  "canary_yellow": "#ffef00",
  "yellow": "#fff000",
  "lemon_yellow": "#fff44f",
  "cadmium_yellow": "#fff600",
  "lemon": "#fff700",
  "lemonchiffon": "#fffacd",
  "floralwhite": "#fffaf0",
  "cream": "#fffdd0",
  "daffodil": "#ffff31",
  "laser_lemon": "#ffff66",
  "canary": "#ffff99",
  "conditioner": "#ffffcc",
  "lightyellow": "#ffffe0"
});
function reverseDict(dict) {
  return Object.fromEntries(
    Object.entries(dict).map(([key, value]) => [value, key])
  );
}
function justDark(hex, space = "oklch") {
  hex = clrHex(hex);

  const white = "#ffffff";
  const black = "#000000";
  const prefersWhite = color => clrContrast(color, white) > clrContrast(color, black);

  if (prefersWhite(hex)) return hex;

  let low = 0;
  let high = 1;

  // Find the smallest mix toward black that makes white slightly higher contrast.
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const color = clrMixMany(hex, black, [mid], space)[0];

    if (prefersWhite(color)) high = mid;
    else low = mid;
  }

  return clrMixMany(hex, black, [high], space)[0];
}
function justDark(hex, space = "oklch") {
  hex = clrHex(hex);

  const prefersWhite = color =>
    clrText(color)?.toLowerCase() === "#ffffff";

  if (prefersWhite(hex)) return hex;

  let low = 0;
  let high = 1;

  // Find the least darkening that makes clrText choose white.
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    const color = clrMixMany(hex, "#000000", [mid], space)[0];

    if (prefersWhite(color)) high = mid;
    else low = mid;
  }

  return clrMixMany(hex, "#000000", [high], space)[0];
}
var ColorByHex = reverseDict(ColorByName);
const CLR_RANGES = {   // channel letters, then the default range of each channel
  rgb: ['rgb', [0, 255], [0, 255], [0, 255]],
  linear: ['rgb', [0, 1], [0, 1], [0, 1]],
  hsl: ['hsl', [0, 360], [0, 100], [0, 100]],
  lab: ['Lab', [0, 100], [-87, 99], [-108, 95]],
  oklab: ['Lab', [0, 1], [-0.24, 0.28], [-0.32, 0.2]],
  lch: ['LCh', [0, 100], [0, 134], [0, 360]],
  oklch: ['LCh', [0, 1], [0, 0.33], [0, 360]],
};

function rColor(h = [0, 360], s = 100, l = 50) {
  const hue = isList(h) ? rChoose(range(...h)) : h;
  const sat = isList(s) ? rChoose(range(...s)) : s;
  const li = isList(l) ? rChoose(range(...l)) : l;
  console.log(hue, sat, li);
  return clrHslToHex(hue, sat, li);
}
function clrRandom() { return rChoose(Object.keys(ColorByHex)); }

function sortColors(hexlist, fDistance) {
  if (hexlist.length < 2) return [...hexlist];

  const remaining = hexlist.slice(1);
  const sorted = [hexlist[0]];

  while (remaining.length) {
    const current = sorted[sorted.length - 1];
    let nearestIndex = 0;
    let nearestDistance = fDistance(current, remaining[0]);

    for (let i = 1; i < remaining.length; i++) {
      const distance = fDistance(current, remaining[i]);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    sorted.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return sorted;
}

function clrDistance(hex1, hex2) {
  const lab1 = clrRgbToLab(...clrHexToRgb(hex1));
  const lab2 = clrRgbToLab(...clrHexToRgb(hex2));

  return Math.hypot(
    lab1[0] - lab2[0],
    lab1[1] - lab2[1],
    lab1[2] - lab2[2]
  );
}
function clrDistanceRgb(hex1, hex2) {
  const a = clrHexToRgb(hex1);
  const b = clrHexToRgb(hex2);
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function clrDistanceLab(hex1, hex2) {
  return clrDistance3(
    clrRgbToLab(...clrHexToRgb(hex1)),
    clrRgbToLab(...clrHexToRgb(hex2))
  );
}

function clrDistanceOklab(hex1, hex2) {
  return clrDistance3(
    clrRgbToOklab(...clrHexToRgb(hex1)),
    clrRgbToOklab(...clrHexToRgb(hex2))
  );
}

function clrDistance3(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function clrDistanceHsl(hex1, hex2) {
  const [h1, s1, l1] = clrRgbToHsl(...clrHexToRgb(hex1));
  const [h2, s2, l2] = clrRgbToHsl(...clrHexToRgb(hex2));

  const dh = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2)) / 180;
  const ds = Math.abs(s1 - s2) / 100;
  const dl = Math.abs(l1 - l2) / 100;

  return Math.hypot(dh, ds, dl);
}
function clrDistanceCiede2000(hex1, hex2) {
  const [L1, a1, b1] = clrRgbToLab(...clrHexToRgb(hex1));
  const [L2, a2, b2] = clrRgbToLab(...clrHexToRgb(hex2));

  const rad = deg => deg * Math.PI / 180;
  const deg = rad => (rad * 180 / Math.PI + 360) % 360;
  const meanHue = (h1, h2, c1, c2) => {
    if (!c1 || !c2) return h1 + h2;
    if (Math.abs(h1 - h2) <= 180) return (h1 + h2) / 2;
    return h1 + h2 < 360
      ? (h1 + h2 + 360) / 2
      : (h1 + h2 - 360) / 2;
  };

  const C1 = Math.hypot(a1, b1);
  const C2 = Math.hypot(a2, b2);
  const Cbar = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Cbar ** 7 / (Cbar ** 7 + 25 ** 7)));

  const ap1 = (1 + G) * a1;
  const ap2 = (1 + G) * a2;
  const Cp1 = Math.hypot(ap1, b1);
  const Cp2 = Math.hypot(ap2, b2);
  const hp1 = deg(Math.atan2(b1, ap1));
  const hp2 = deg(Math.atan2(b2, ap2));

  const dL = L2 - L1;
  const dC = Cp2 - Cp1;

  let dh = 0;
  if (Cp1 * Cp2 !== 0) {
    if (Math.abs(hp2 - hp1) <= 180) dh = hp2 - hp1;
    else if (hp2 - hp1 > 180) dh = hp2 - hp1 - 360;
    else dh = hp2 - hp1 + 360;
  }
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(rad(dh / 2));

  const Lbar = (L1 + L2) / 2;
  const Cpbar = (Cp1 + Cp2) / 2;
  const hpbar = meanHue(hp1, hp2, Cp1, Cp2);

  const T =
    1
    - 0.17 * Math.cos(rad(hpbar - 30))
    + 0.24 * Math.cos(rad(2 * hpbar))
    + 0.32 * Math.cos(rad(3 * hpbar + 6))
    - 0.20 * Math.cos(rad(4 * hpbar - 63));

  const SL = 1 + 0.015 * (Lbar - 50) ** 2
    / Math.sqrt(20 + (Lbar - 50) ** 2);
  const SC = 1 + 0.045 * Cpbar;
  const SH = 1 + 0.015 * Cpbar * T;

  //const deltaTheta = 30 * Math.exp(-((hpbar - 275) / 25) ** 2);
  const deltaTheta = 30 * Math.exp(-(((hpbar - 275) / 25) ** 2));
  const RC = 2 * Math.sqrt(Cpbar ** 7 / (Cpbar ** 7 + 25 ** 7));
  const RT = -RC * Math.sin(rad(2 * deltaTheta));

  const l = dL / SL;
  const c = dC / SC;
  const h = dH / SH;

  return Math.sqrt(l * l + c * c + h * h + RT * c * h);
}

function clrTrans(c, alpha) {
  let hex = clrHex(c);
  if (alpha == 1) return hex;
  const opacity = Math.round(Math.max(0, Math.min(1, alpha)) * 255).toString(16).padStart(2, "0");
  return `${hex}${opacity}`;
}
function clrContrast(hex1, hex2) {
  let a = clrLuminance(hex1), b = clrLuminance(hex2);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
function clrContrastRatio(hex1, hex2) {
  // 1. WCAG contrast ratio: best for readable text/background pairs.
  const luminance = hex => {
    const [r, g, b] = clrHexToRgb(hex).map(v => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const [a, b] = [luminance(hex1), luminance(hex2)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
}
function clrLightnessContrast(hex1, hex2) {
  // 2. Lightness contrast in LAB: chooses the color with the biggest
  // perceptual lightness difference.
  const L1 = clrRgbToLab(...clrHexToRgb(hex1))[0];
  const L2 = clrRgbToLab(...clrHexToRgb(hex2))[0];
  return Math.abs(L1 - L2);
}
function clrHueContrast(hex1, hex2) {
  // 3. Complementary contrast: prefers colors opposite in hue,
  // while also rewarding saturation.
  const [h1, s1] = clrRgbToHsl(...clrHexToRgb(hex1));
  const [h2, s2] = clrRgbToHsl(...clrHexToRgb(hex2));
  const hueGap = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2));
  return (hueGap / 180) * (s1 / 100) * (s2 / 100);
}
function clrBestBy(hex, list, scoreFn) {
  if (!list.length) return null;

  return list.reduce((best, color) =>
    scoreFn(hex, color) > scoreFn(hex, best) ? color : best
  );
}
function clrDarker(c, percent = 10) {
  /* Returns a new darker HEX string adjusted by the given percentage */
  let hex = clrHex(c);
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  let factor = 1 - percent / 100;
  r = Math.max(0, Math.floor(r * factor));
  g = Math.max(0, Math.floor(g * factor));
  b = Math.max(0, Math.floor(b * factor));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function clrLighter(c, percent = 10) {
  /* Returns a new lighter HEX string adjusted by the given percentage */
  let hex = clrHex(c);
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  let factor = percent / 100;
  r = Math.min(255, Math.floor(r + (255 - r) * factor));
  g = Math.min(255, Math.floor(g + (255 - g) * factor));
  b = Math.min(255, Math.floor(b + (255 - b) * factor));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function clrDetect(hex, dict) {
  console.assert(hex.startsWith('#'), 'no hex', hex);
  if (nundef(dict)) dict = ColorByHex;
  if (nundef(CLR_LAB.lab)) {
    let keys = CLR_LAB.keys = Object.keys(dict), n = keys.length;
    CLR_LAB.lab = new Float64Array(n * 3);
    keys.forEach((k, i) => CLR_LAB.lab.set(clrRgbToLab(...clrHexToRgb(k)), i * 3));
  }
  let [L, A, B] = clrRgbToLab(...clrHexToRgb(hex)), bd = Infinity, bi = 0, n = CLR_LAB.keys.length, lab = CLR_LAB.lab;
  for (let i = 0, j = 0; i < n; i++, j += 3) {
    let d = (L - lab[j]) ** 2 + (A - lab[j + 1]) ** 2 + (B - lab[j + 2]) ** 2;
    if (d < bd) { bd = d; bi = i; }
  }
  //console.log(CLR_LAB.keys[bi],bi,ColorByHex[CLR_LAB.keys[bi]]);
  return CLR_LAB.keys[bi];   // the hex, not the name
}
function clrHex(c) {
  if (!c) return '#000000';
  let str = c.trim().toLowerCase();
  if (str[0] == '#') {
    return str.length == 7 ? str : str.length == 9 ? str.slice(0, 7) : ('#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3]);
  }
  else if (ColorByName[str]) return ColorByName[str];
  console.assert(false, 'no color for', str);
}
function clrHue(hex) { return clrRgbToHsl(...clrHexToRgb(hex))[0]; }

function clrLightness(hex) { return clrRgbToLab(...clrHexToRgb(hex))[0]; }

function clrLuminance(hex) {
  let [r, g, b] = clrHexToRgb(hex).map(v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function clrFromLin(v) { return 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055); }

function clrRgbToOklab(r, g, b) {
  let R = CLR_LIN[Math.round(r)], G = CLR_LIN[Math.round(g)], B = CLR_LIN[Math.round(b)];
  let l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  let m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  let s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
  1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
  0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
}
function clrOklabToLin(L, a, b) {   // linear sRGB 0..1, may fall outside that range
  let l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  let m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  let s = (L - 0.0894841775 * a - 1.2914855480 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
  -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
  -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
}
function clrOklabToRgb(L, a, b) { return clrOklabToLin(L, a, b).map(clrFromLin); }

function clrToPolar([L, a, b]) { return [L, Math.hypot(a, b), (Math.atan2(b, a) * 180 / Math.PI + 360) % 360]; }

function clrFromPolar([L, C, H]) { let r = H * Math.PI / 180; return [L, C * Math.cos(r), C * Math.sin(r)]; }

function clrHexToHsl(hex) {
  let v = CLR_HSL_CACHE.get(hex);
  if (!v) {
    if (CLR_HSL_CACHE.size >= 10000) CLR_HSL_CACHE.clear();   // keep memory bounded
    v = clrRgbToHsl(...clrHexToRgb(hex));
    //console.log('hallo!!!', v)
    CLR_HSL_CACHE.set(hex, v);
  }
  return v.slice();                                          // copy, so callers can't corrupt the cache
}
function clrHexToRgb(hex) {
  let h = hex[0] == '#' ? hex.slice(1) : hex;
  if (h.length == 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  let n = parseInt(h, 16);
  return [n >> 16, (n >> 8) & 255, n & 255];
}
function clrHslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;//console.log(s,l)
  return clrRgbToHex(...clrHslToRgb(h, clrClamp(s, 0, 100), clrClamp(l, 0, 100)));
}
function clrHslToRgb(h, s, l) {
  s /= 100; l /= 100;
  let k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  let f = n => 255 * (l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}
function clrLabToRgb(L, a, b) {
  let fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
  let inv = t => t ** 3 > 216 / 24389 ? t ** 3 : (116 * t - 16) / (24389 / 27);
  let x = inv(fx) * 0.95047, y = inv(fy), z = inv(fz) * 1.08883;
  let gam = v => 255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);
  return [gam(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
  gam(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
  gam(0.0556434 * x - 0.2040259 * y + 1.0572252 * z)];
}
function clrRgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => clrClamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
}
function clrRgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2, h = 0, s = 0;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    h = mx == r ? ((g - b) / d) % 6 : mx == g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
  }
  return [h, s * 100, l * 100];
}
function clrRgbToLab(r, g, b) {
  let lin = v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  let R = lin(r), G = lin(g), B = lin(b);
  let x = (0.4124564 * R + 0.3575761 * G + 0.1804375 * B) / 0.95047;
  let y = 0.2126729 * R + 0.7151522 * G + 0.0721750 * B;
  let z = (0.0193339 * R + 0.1191920 * G + 0.9503041 * B) / 1.08883;
  let f = t => t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116;
  let fx = f(x), fy = f(y), fz = f(z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}
function clrShiftRgb(hex, i, d) {
  let c = clrHexToRgb(hex); c[i] += d;
  return clrRgbToHex(...c);
}
function clrShiftHsl(hex, i, d) {
  let c = clrRgbToHsl(...clrHexToRgb(hex)); c[i] += d;
  c[0] = ((c[0] % 360) + 360) % 360; c[1] = clrClamp(c[1], 0, 100); c[2] = clrClamp(c[2], 0, 100);
  return clrRgbToHex(...clrHslToRgb(...c));
}
function clrShiftLab(hex, i, d) {
  let c = clrRgbToLab(...clrHexToRgb(hex)); c[i] += d; c[0] = clrClamp(c[0], 0, 100);
  return clrRgbToHex(...clrLabToRgb(...c));
}
function clrClamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function clrShiftR(hex, d) { return clrShiftRgb(hex, 0, d); }
function clrShiftG(hex, d) { return clrShiftRgb(hex, 1, d); }
function clrShiftB(hex, d) { return clrShiftRgb(hex, 2, d); }
function clrShiftH(hex, d) { return clrShiftHsl(hex, 0, d); }
function clrShiftS(hex, d) { return clrShiftHsl(hex, 1, d); }
function clrShiftL(hex, d) { return clrShiftHsl(hex, 2, d); }
function clrShiftLabL(hex, d) { return clrShiftLab(hex, 0, d); }
function clrShiftLabA(hex, d) { return clrShiftLab(hex, 1, d); }
function clrShiftLabB(hex, d) { return clrShiftLab(hex, 2, d); }

function clrMix(hex1, hex2, t = 0.5, space = 'lab') { return clrMixMany(hex1, hex2, [t], space)[0]; }
function clrMixMany(hex1, hex2, ts, space = 'lab') {
  let sp = CLR_SPACES[space];
  if (!sp) throw new Error('clrMix: unknown space ' + space);
  let c1 = clrHexToRgb(hex1), c2 = clrHexToRgb(hex2), a = sp.to(c1), b = sp.to(c2), h = sp.hue, dh = 0;
  if (h !== undefined) {
    if (a[sp.chroma] < sp.eps) a[h] = b[h]; else if (b[sp.chroma] < sp.eps) b[h] = a[h];   // gray has no hue
    dh = ((b[h] - a[h] + 540) % 360) - 180;                                                 // shortest way round
  }
  return ts.map(t => {
    t = clrClamp(t, 0, 1);
    if (t == 0) return clrRgbToHex(...c1);
    if (t == 1) return clrRgbToHex(...c2);
    let m = a.map((v, i) => v + (b[i] - v) * t);
    if (h !== undefined) m[h] = ((a[h] + dh * t) % 360 + 360) % 360;
    return clrRgbToHex(...sp.from(m));
  });
}
function clrName(c) {
  let hex = clrHex(c);
  return ColorByHex[clrDetect(hex)];
}
function clrPrimary(c) {
  let hex = clrHex(c);
  let hsl = clrRgbToHsl(...clrHexToRgb(hex));
  return clrHslToHex(hsl[0], 100, 50);
}
function clrReplace(text, func) {
  return text.replace(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi, func);
}
function clrReplaceCycle(text, list, perOccurrence = false) {
  if (!list.length) return text;
  let map = new Map(), i = 0;
  return clrReplace(text, h => {
    let key = h.toLowerCase();
    if (perOccurrence || !map.has(key)) map.set(key, list[i++ % list.length]);
    return map.get(key);
  });
}
function clrText(c, list = ['#ffffff', '#000000'], minContrast = 1.8) {
  //favors white. set minContrast to 3 for more black
  let hex = clrHex(c)
  let best = null, bl = -1, fallback = null, fc = -1;
  for (let c of list) {
    let k = clrContrast(hex, c), l = clrLuminance(c);
    if (k >= minContrast && l > bl) { bl = l; best = c; }   // readable: keep the lightest
    if (k > fc) { fc = k; fallback = c; }                   // otherwise: highest contrast
  }
  return best ?? fallback;
}
function clrWarmer(hex, amt = 0.08) {
  let [r, g, b] = clrHexToRgb(hex);
  return clrRgbToHex(r * (1 + amt), g, b * (1 - amt));
}

function palMix(hex1, hex2, n = 5, space = 'lab', ignoreExtremes = false) {
  [hex1, hex2] = [clrHex(hex1), clrHex(hex2)];
  if (ignoreExtremes) { n += 2; }
  if (n < 1) return [];
  let res = clrMixMany(hex1, hex2, Array.from({ length: n }, (_, i) => n > 1 ? i / (n - 1) : 0), space);
  if (ignoreExtremes) { res = res.slice(1, res.length - 1); }
  return res;
}
function palShade(hex, n = 5, space = 'hsl') {
  // hsl | lch | oklch
  hex = clrHex(hex);
  let sp = CLR_SPACES[space], li = { hsl: 2, lch: 0, oklch: 0 }[space], top = space == 'oklch' ? 1 : 100;
  if (!sp || li === undefined) throw new Error('palShade: space must be hsl, lch or oklch');
  if (n < 2) return n == 1 ? [clrRgbToHex(...clrHexToRgb(hex))] : [];
  let c = sp.to(clrHexToRgb(hex)), ci = sp.chroma, C0 = c[ci];
  if (space == 'hsl') c[ci] = Math.min(c[ci], 100);          // float noise can give 100.00000000000001
  let fits = v => sp.from(v).every(x => x >= -0.005 && x <= 255.005);
  return Array.from({ length: n }, (_, i) => {
    let v = c.slice(); v[li] = top * (1 - i / (n - 1));
    if (space != 'hsl' && !fits(v)) {       // too colorful for this lightness: shrink chroma until it fits
      let lo = 0, hi = C0;
      for (let k = 0; k < 14; k++) { v[ci] = (lo + hi) / 2; if (fits(v)) lo = v[ci]; else hi = v[ci]; }
      v[ci] = lo;
    }
    return clrRgbToHex(...sp.from(v));
  });
}
function palFromText(text) {
  let matches = text.match(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi) || [];
  return [...new Set(matches.map(h => h.toLowerCase()))];
}
function palPrepCanvas(img, maxPixels = 100) {
  // 1. Downscale for fast buffer extraction
  let w = img.naturalWidth || img.width || 100;
  let h = img.naturalHeight || img.height || 100;

  let cvs = document.createElement('canvas');
  cvs.width = maxPixels;
  cvs.height = Math.max(1, Math.round((h * maxPixels) / w));

  let ctx = cvs.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, cvs.width, cvs.height);
  let d = ctx.getImageData(0, 0, cvs.width, cvs.height).data;

  return { cvs, ctx, d };
}
function palClaude(img, n = 5, minDist = 10, bits = 4, maxPixels = 100) {
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);

  let s = 8 - bits, bins = new Map();
  for (let i = 0; i < d.length; i += 4) {                 // 1. count pixels per coarse bucket
    if (d[i + 3] < 128) continue;                         //    (skip transparent ones)
    let key = ((d[i] >> s) << (2 * bits)) | ((d[i + 1] >> s) << bits) | (d[i + 2] >> s);
    let b = bins.get(key);
    if (!b) bins.set(key, b = [0, 0, 0, 0]);
    b[0]++; b[1] += d[i]; b[2] += d[i + 1]; b[3] += d[i + 2];
  }
  let clusters = [];                                      // 2. merge buckets that look alike, biggest first
  for (let b of [...bins.values()].sort((a, c) => c[0] - a[0])) {
    let lab = clrRgbToLab(b[1] / b[0], b[2] / b[0], b[3] / b[0]);
    let c = clusters.find(c => (c.lab[0] - lab[0]) ** 2 + (c.lab[1] - lab[1]) ** 2 + (c.lab[2] - lab[2]) ** 2 < minDist ** 2);
    if (c) { c.n += b[0]; c.r += b[1]; c.g += b[2]; c.b += b[3]; }
    else clusters.push({ lab, n: b[0], r: b[1], g: b[2], b: b[3] });
  }
  return clusters.sort((a, c) => c.n - a.n).slice(0, n)   // 3. most frequent first, as average color
    .map(c => clrRgbToHex(c.r / c.n, c.g / c.n, c.b / c.n));
}
function palGemini(img, count = 5, tolerance = 16, maxPixels = 100) {
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);
  let imgData = d;
  let counts = {};

  for (let i = 0; i < imgData.length; i += 4) {
    let a = imgData[i + 3];
    if (a < 128) continue; // Skip transparent/semi-transparent pixels

    // Quantize RGB values by tolerance step to group similar shades
    let r = Math.round(imgData[i] / tolerance) * tolerance;
    let g = Math.round(imgData[i + 1] / tolerance) * tolerance;
    let b = Math.round(imgData[i + 2] / tolerance) * tolerance;

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    let hex = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    counts[hex] = (counts[hex] || 0) + 1;
  }

  return Object.keys(counts)
    .sort((a, b) => counts[b] - counts[a])
    .slice(0, count);
}
function palMostDifferent(img, count = 5, acceptedMax = 2500, maxPixels = 100) {
  // /* Extracts n distinct colors using CIELAB max-min distance with an early-exit acceptedMax threshold */
  let { cvs, ctx, d } = palPrepCanvas(img, maxPixels);
  let bins = new Map();

  // 2. Aggregate pixels into 4-bit truncated buckets
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 128) continue; // Skip transparent pixels
    let r = d[i] & 0xf0;
    let g = d[i + 1] & 0xf0;
    let b = d[i + 2] & 0xf0;
    let key = (r << 16) | (g << 8) | b;

    let bData = bins.get(key);
    if (!bData) {
      bins.set(key, { b: key, lab: clrRgbToLab(r, g, b), n: 1, r: r, g: g });
    } else {
      bData.n++;
    }
  }

  let candidates = [...bins.values()];
  if (candidates.length <= count) {
    return candidates.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
  }

  // 3. Anchor with the most frequent color
  candidates.sort((a, b) => b.n - a.n);
  let selected = [candidates[0]];
  candidates.shift();

  // 4. Distance sampling loop with acceptedMax early exit
  while (selected.length < count && candidates.length > 0) {
    let maxMinDist = -1;
    let bestIdx = -1;

    for (let i = 0; i < candidates.length; i++) {
      let cand = candidates[i];
      let minDist = Infinity;

      for (let s of selected) {
        let dist = (cand.lab[0] - s.lab[0]) ** 2 +
          (cand.lab[1] - s.lab[1]) ** 2 +
          (cand.lab[2] - s.lab[2]) ** 2;
        if (dist < minDist) minDist = dist;
      }

      // Early exit if distance threshold is satisfied
      if (minDist >= acceptedMax) {
        bestIdx = i;
        break;
      }

      // Track current best candidate if threshold is not reached yet
      if (minDist > maxMinDist) {
        maxMinDist = minDist;
        bestIdx = i;
      }
    }

    if (bestIdx !== -1) {
      selected.push(candidates[bestIdx]);
      candidates.splice(bestIdx, 1);
    } else {
      break;
    }
  }

  return selected.map(c => clrHex('#' + c.b.toString(16).padStart(6, '0')));
}
function palVariety(n, anchors = ["#ff0000", "#ffff00", "#00ffff", "#0000ff", "#ff00ff",], space = 'lab', includeAnchors = true) {
  let len = anchors.length;
  // let betweenEach = Math.ceil(n / (len-1));console.log(betweenEach);
  let res = includeAnchors ? [anchors[0]] : [];
  for (let i = 0; i < len - 1; i++) {
    let a = anchors[i];
    let b = anchors[i + 1];
    res = res.concat(palMix(a, b, n, space, true));
    if (includeAnchors) res.push(b);

  }
  return res;
}









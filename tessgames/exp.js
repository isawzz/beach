
















const Specialstar_metadata = new TessagonMetadata({
	name: "SpecialStar",
	num_color_patterns: 2,
	classification: "archimedean",
	shapes: ["Specialgons", "stars", "quads"],
	sides: [8, 8, 4],
	hv_ratio: 1.0
});

class SpecialStarTile extends Tile {
	constructor(tessagon, options = {}) {
		super(tessagon, options);
		// Symmetries automatically mirror top-left quadrant to bottom & right
		this.h_symmetric = true;
		this.v_symmetric = true;
	}

	init_verts() {
		return {
			top: {
				left: { oct_corner: null, star_inner: null },
				right: { oct_corner: null, star_inner: null },
				star_corner: { left: null, right: null },
				oct_flat: null
			},
			bottom: {
				left: { oct_corner: null, star_inner: null },
				right: { oct_corner: null, star_inner: null },
				star_corner: { left: null, right: null },
				oct_flat: null
			},
			left: {
				star_corner: { top: null, bottom: null },
				oct_flat: null
			},
			right: {
				star_corner: { top: null, bottom: null },
				oct_flat: null
			}
		};
	}

	init_faces() {
		return {
			middle: null, // Central Specialgon
			star: {
				top: { left: null, right: null },
				bottom: { left: null, right: null }
			},
			bridge: {
				top: null,
				bottom: null,
				left: null,
				right: null
			}
		};
	}

	calculate_verts() {
		const s = 1.0 / (2.0 + Math.SQRT2); // ~0.29289
		const s_half = s / 2.0;

		// 1. Tile Corner & Star vertices
		this.add_vert(["left", "star_corner", "top"], 0.0, 1.0 - s, { h_boundary: true });
		this.add_vert(["top", "star_corner", "left"], s, 1.0, { v_boundary: true });
		this.add_vert(["top", "left", "star_inner"], s_half, 1.0 - s_half);

		// 2. Specialgon vertices
		this.add_vert(["top", "left", "oct_corner"], s, 1.0 - s);
		this.add_vert(["top", "oct_flat"], 0.5, 1.0, { v_boundary: true });
		this.add_vert(["left", "oct_flat"], 0.0, 0.5, { h_boundary: true });
	}

	calculate_faces() {
		// --- Face 1: The Central Specialgon (Fully inside the tile) ---
		this.add_face("middle", [
			["top", "oct_flat"],
			["top", "left", "oct_corner"],
			["left", "oct_flat"],
			["bottom", "left", "oct_corner"],
			["bottom", "oct_flat"],
			["bottom", "right", "oct_corner"],
			["right", "oct_flat"],
			["top", "right", "oct_corner"]
		], { face_type: "Specialgon" });

		// --- Face 2: Corner Star (Spans 4 neighboring tiles) ---
		// Defined at the top-left corner using symmetry + neighbor traversal
		this.add_face(
			["star", "top", "left"],
			[
				["top", "star_corner", "left"],
				["top", "left", "star_inner"],
				["left", "star_corner", "top"],
				left_tile(["right", "star_corner", "top"]),
				left_tile(["top", "right", "star_inner"]),
				left_tile(["top", "star_corner", "right"]),
				top_left_tile(["bottom", "star_corner", "right"]),
				top_left_tile(["bottom", "right", "star_inner"]),
				top_left_tile(["right", "star_corner", "bottom"]),
				top_tile(["left", "star_corner", "bottom"]),
				top_tile(["bottom", "left", "star_inner"]),
				top_tile(["bottom", "star_corner", "left"])
			],
			{ face_type: "star", corner: true }
		);

		// --- Face 3: Horizontal Bridge Quad (Spans 2 tiles across the left border) ---
		this.add_face(
			["bridge", "left"],
			[
				["left", "oct_flat"],
				["top", "left", "oct_corner"],
				["left", "star_corner", "top"],
				left_tile(["right", "star_corner", "top"]),
				left_tile(["top", "right", "oct_corner"]),
				left_tile(["right", "oct_flat"])
			],
			{ face_type: "bridge", h_boundary: true }
		);

		// --- Face 4: Vertical Bridge Quad (Spans 2 tiles across the top border) ---
		this.add_face(
			["bridge", "top"],
			[
				["top", "oct_flat"],
				top_tile(["bottom", "oct_flat"]),
				top_tile(["bottom", "left", "oct_corner"]),
				top_tile(["bottom", "star_corner", "left"]),
				["top", "star_corner", "left"],
				["top", "left", "oct_corner"]
			],
			{ face_type: "bridge", v_boundary: true }
		);
	}

	// Pattern 1: Distinct colors per geometry type
	color_pattern1() {
		this.color_face("middle", 1); // Center Specialgons
		this.color_face(["star", "top", "left"], 2); // Corner Stars
		this.color_face(["bridge", "left"], 0); // Bridges
		this.color_face(["bridge", "top"], 0);
	}

	// Pattern 2: Checkerboard Specialgons with Accentuated Stars
	color_pattern2() {
		const parity = (this.fingerprint[0] + this.fingerprint[1]) % 2;
		this.color_face("middle", parity);
		this.color_face(["star", "top", "left"], 2);
		this.color_face(["bridge", "left"], 3);
		this.color_face(["bridge", "top"], 3);
	}
}

class SpecialStarTessagon extends Tessagon {
	static tile_class = SpecialStarTile;
	static metadata = Specialstar_metadata;
}

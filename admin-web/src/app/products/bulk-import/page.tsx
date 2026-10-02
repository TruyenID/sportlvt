"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileDown, Info, PlayCircle, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createProduct, getBrands, getCategories } from "@/lib/endpoints";
import { slugify } from "@/lib/utils";
import type { Brand, Category } from "@/lib/types";
import { parseBulkRows, type ParsedRow } from "./parse";
import { downloadTemplateExcel, parseExcelFile } from "./excel";

const PLACEHOLDER = `Áo thun thể thao Nam\tÁo thun\tKady\t250000\t199000\tVải thun co giãn 4 chiều\tMô tả chi tiết sản phẩm...\thttps://.../thumb.webp\tfalse\tAT001=M=Đen=250000=199000=20=https://.../m-den.webp|AT002=L=Đen=250000=199000=15=`;

export default function BulkImportPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [raw, setRaw] = useState("");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<Record<number, "ok" | "error">>({});
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
    getBrands().then(setBrands).catch(() => setBrands([]));
  }, []);

  function handlePreview() {
    setError(null);
    setResults({});
    setRows(parseBulkRows(raw, categories, brands));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileError(null);
    setError(null);
    setResults({});
    try {
      const parsed = await parseExcelFile(file, categories, brands);
      setRows(parsed);
    } catch (err) {
      setFileError(err instanceof Error ? err.message : "Không đọc được file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleImport() {
    setImporting(true);
    setError(null);
    const next: Record<number, "ok" | "error"> = {};
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row.errors.length > 0) {
        next[i] = "error";
        continue;
      }
      try {
        await createProduct({
          category_id: row.categoryId,
          brand_id: row.brandId,
          name: row.name,
          slug: slugify(row.name),
          short_description: row.shortDescription || null,
          description: row.description || null,
          base_price: row.basePrice,
          sale_price: row.salePrice,
          thumbnail: row.thumbnail || null,
          is_active: true,
          is_featured: row.isFeatured,
          variants: row.variants.map((v) => ({
            sku: v.sku,
            size: v.size || null,
            color: v.color || null,
            price: v.price,
            sale_price: v.salePrice,
            stock: v.stock,
            image: v.image || null,
          })),
        });
        next[i] = "ok";
      } catch (e) {
        row.errors.push(e instanceof Error ? e.message : "Lỗi không xác định.");
        next[i] = "error";
      }
      setResults({ ...next });
    }
    setImporting(false);
  }

  const validCount = rows.filter((r) => r.errors.length === 0).length;

  return (
    <div className="flex flex-col gap-4 pb-10">
      <div className="flex items-center gap-3">
        <Link href="/products">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-semibold">Thêm sản phẩm hàng loạt</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="size-4 text-primary" /> Định dạng dán dữ liệu
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>
            Mỗi dòng là 1 sản phẩm, các cột cách nhau bằng dấu <b>Tab</b> (dán trực tiếp từ Excel/Google Sheets) hoặc
            dấu phẩy — theo đúng thứ tự:
          </p>
          <p className="rounded-lg bg-muted/50 p-2 font-mono text-xs">
            Tên | Danh mục | Thương hiệu (để trống nếu không có) | Giá gốc | Giá KM | Mô tả ngắn | Mô tả chi tiết |
            Ảnh đại diện (URL) | Nổi bật (true/false) | Biến thể
          </p>
          <p>
            Cột <b>Biến thể</b>: nhiều biến thể cách nhau bằng <b>|</b>, mỗi biến thể theo thứ tự{" "}
            <span className="font-mono">SKU=Size=Màu=Giá=GiáKM=TồnKho=ẢnhURL</span> (bỏ trống phần nào cũng được, vẫn
            giữ đủ dấu <b>=</b>). Danh mục/Thương hiệu phải trùng đúng tên đã có sẵn trong hệ thống.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Nhập từ file Excel/CSV</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" className="w-fit gap-1.5" onClick={downloadTemplateExcel}>
              <FileDown className="size-4" /> Tải file mẫu
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-fit gap-1.5"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="size-4" /> Chọn file Excel/CSV để nhập
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {fileError && <p className="text-sm text-destructive">{fileError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dán dữ liệu</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <textarea
            rows={8}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder={PLACEHOLDER}
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          <Button type="button" variant="outline" className="w-fit gap-1.5" onClick={handlePreview}>
            <PlayCircle className="size-4" /> Xem trước
          </Button>
        </CardContent>
      </Card>

      {rows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Xem trước ({validCount}/{rows.length} dòng hợp lệ)
            </CardTitle>
            <Button
              type="button"
              className="gap-1.5"
              disabled={importing || validCount === 0}
              onClick={handleImport}
            >
              <UploadCloud className="size-4" /> {importing ? "Đang import..." : `Import ${validCount} sản phẩm`}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {error && <p className="text-sm text-destructive">{error}</p>}
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex flex-col gap-1 rounded-lg border border-border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {i + 1}. {row.name || "(không có tên)"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.variants.length} biến thể · {row.categoryName || "?"} ·{" "}
                    {row.brandName || "không thương hiệu"}
                  </span>
                  {row.errors.length > 0 && (
                    <span className="text-xs text-destructive">{row.errors.join(" · ")}</span>
                  )}
                </div>
                {results[i] && (
                  <Badge variant={results[i] === "ok" ? "default" : "destructive"} className="w-fit rounded-full">
                    {results[i] === "ok" ? "Đã tạo" : "Lỗi"}
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

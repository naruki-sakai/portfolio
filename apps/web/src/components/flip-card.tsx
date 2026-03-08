"use client";

import Image from "next/image";

type RevealCardProps = {
  icon: string;
  iconSize?: number;
  title: string;
  description: string;
};

export function RevealCard({ icon, iconSize = 40, title, description }: RevealCardProps) {
  return (
    <div className="reveal-card">
      {/* 常に表示: アイコン + タイトル */}
      <div className="reveal-card__header">
        <Image src={icon} alt={title} width={iconSize} height={iconSize} />
        <h3 className="mt-3 text-base text-gray-900">{title}</h3>
      </div>

      {/* ホバーで clip-path リビール */}
      <div className="reveal-card__overlay">
        <p className="text-[15px] leading-relaxed text-white whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}

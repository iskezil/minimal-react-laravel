<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar
                ? (Storage::disk('public')->exists($this->avatar)
                    ? asset(Storage::url($this->avatar))
                    : asset($this->avatar))
                : null,
            'status' => $this->status,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at?->toDateTimeString(),
            'roles' => $this->roles->pluck('id')->toArray(),
        ];
    }
}

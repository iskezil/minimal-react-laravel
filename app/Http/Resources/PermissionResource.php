<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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
            'module' => $this->module,
            'created_at' => $this->created_at?->toDateString(),
            'roles' => RoleResource::collection($this->whenLoaded('roles'))->resolve($request),
        ];
    }
}
